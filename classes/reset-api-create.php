<?php
class WP_React_Settings_Rest_Route {
	public function __construct() {
		add_action('rest_api_init', [$this, 'create_rest_routes']);
	}
	public function create_rest_routes() {
		register_rest_route('wprest/v1','/settings', [
			'methods'   => 'GET',
			'callback'  => [$this, 'get_settings'],
			'permission_callback'   => [$this, 'get_setting_permission']
		]);
		register_rest_route('wprest/v1','/settings', [
			'methods'   => 'POST',
			'callback'  => [$this, 'save_settings'],
			'permission_callback'   => [$this, 'get_setting_permission']
		]);
		register_rest_route('wprest/v1','/settings/update/(?P<id>\d+)/', [
			'methods'   => 'GET',
			'callback'  => [$this, 'get_update_settings'],
			'permission_callback'   => [$this, 'get_setting_permission']
		]);
		register_rest_route('wprest/v1','/settings/update/(?P<id>\d+)/', [
			'methods'   => 'POST',
			'callback'  => [$this, 'update_settings'],
			'permission_callback'   => [$this, 'get_setting_permission']
		]);
		register_rest_route('wprest/v1','/settings/delete/(?P<id>\d+)/', [
			'methods'   => 'DELETE',
			'callback'  => [$this, 'delete_settings'],
			'permission_callback'   => [$this, 'get_setting_permission']
		]);
	}
	public function get_settings($request) {
//		$firstname = get_option('react_firstname');
//		$lastname = get_option('react_lastname');
//		$email = get_option('react_email');
//
//		$response = [
//			'firstname'	 => $firstname,
//			'lastname'	 => $lastname,
//			'email'	 => $email,
//		];

//		global $wpdb;
//		$table_name = $wpdb->prefix . 'react_user_data';
//		$all_query = $wpdb->get_results(
//			$wpdb->prepare(
//				"SELECT * FROM {$table_name}"
//			),ARRAY_A
//		);
//
//		return $all_query;

		// return rest_ensure_response($response);


		global $wpdb;
		$table_name = $wpdb->prefix . 'react_user_data';

		$page = isset($_GET['page']) && is_numeric($_GET['page']) && $_GET['page'] > 0 ? $_GET['page'] : 1; // Default to page 1 if not provided
		$per_page = 10;

		$offset = ($page - 1) * $per_page;

		$query = $wpdb->prepare("SELECT * FROM {$table_name} LIMIT %d, %d", $offset, $per_page);

		$paginated_results = $wpdb->get_results($query, ARRAY_A);

		$total_results = $wpdb->get_var("SELECT COUNT(*) FROM {$table_name}");

		$total_pages = ceil($total_results / $per_page);

		$response = array(
			'results'     => $paginated_results,
			'page'        => $page,
			'total_pages' => $total_pages,
			'total_results' => $total_results // Include total_results in the response
		);

		wp_send_json($response);
	}
	public function save_settings($req) {
		$firstname = sanitize_text_field($req['firstname']);
		$lastname = sanitize_text_field($req['lastname']);
		$email = sanitize_email($req['email']);

		global $wpdb;
		$table_name = $wpdb->prefix . 'react_user_data';
		$email_exists = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$table_name} WHERE email = %s",
				$email
			)
		);

		if ($email_exists) {
			$message = "Email already exists. Please use a different email.";
			return rest_ensure_response(['error' => true, 'message' => $message]);
		}

		update_option('react_firstname', $firstname);
		update_option('react_lastname', $lastname);
		update_option('react_email', $email);

		$escaped_firstname = esc_sql($firstname);
		$escaped_lastname = esc_sql($lastname);
		$escaped_email = esc_sql($email);

		$insert_query = "INSERT INTO {$table_name} (firstname, lastname, email) VALUES ('{$escaped_firstname}', '{$escaped_lastname}', '{$escaped_email}')";
		$wpdb->query($insert_query);

		$message = "User data successfully saved.";

		return rest_ensure_response(['success' => true, 'message' => $message]);
	}
	public function get_update_settings($req) {
		$id = $req['id'];

		global $wpdb;
		$table_name = $wpdb->prefix . 'react_user_data';
		$query = $wpdb->prepare("SELECT * FROM {$table_name} WHERE id = %d", $id);
		$result = $wpdb->get_results($query);

		return $result;
	}
	public function update_settings($req) {
		global $wpdb;
		$table_name = $wpdb->prefix . 'react_user_data';

		$id = $req['id'];
		$firstname = sanitize_text_field($req['firstname']);
		$lastname = sanitize_text_field($req['lastname']);
		$email = sanitize_email($req['email']);

		$escaped_id = esc_sql($id);
		$escaped_firstname = esc_sql($firstname);
		$escaped_lastname = esc_sql($lastname);
		$escaped_email = esc_sql($email);

		$existing_record = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table_name} WHERE id = %d", $id));

		if (!$existing_record) {
			$message = "User with ID does not exist.";
			return rest_ensure_response(['success' => false, 'message' => $message]);
		}

		$email_exists = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$table_name} WHERE email = %s AND id != %d", $email, $id
			)
		);

		if ($email_exists) {
			$message = "Email already exists. Please use a different email.";
			return rest_ensure_response(['error' => true, 'message' => $message]);
		}

		$update_query = $wpdb->prepare(
			"UPDATE {$table_name} SET firstname = %s, lastname = %s, email = %s WHERE id = %d",
			$escaped_firstname,
			$escaped_lastname,
			$escaped_email,
			$escaped_id
		);
		$wpdb->query($update_query);

		$message = "User data update successfully saved.";

		return rest_ensure_response(['success' => true, 'message' => $message]);
	}

	public function delete_settings($req) {
		global $wpdb;
		$table_name = $wpdb->prefix . 'react_user_data';
		$id = $req['id'];

		$existing_record = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table_name} WHERE id = %d", $id));

		if (!$existing_record) {
			$message = "User with ID does not exist.";
			return rest_ensure_response(['success' => false, 'message' => $message]);
		}

		$delete_query = $wpdb->prepare("DELETE FROM {$table_name} WHERE id = %d", $id);
		$wpdb->query($delete_query);

		$message = "User data successfully deleted.";
		return rest_ensure_response(['success' => true, 'message' => $message]);
	}
	public function get_setting_permission() {
		return true;
	}
	public function get_admin_setting_permission() {
		error_log('Permission callback called');
		if (current_user_can('administrator')) {
			error_log('User is an administrator');
			return true;
		} else {
			error_log('User is not an administrator');
			return new WP_Error('rest_forbidden', __('You do not have permission to access this resource.'), array('status' => 403));
		}
	}
}

new WP_React_Settings_Rest_Route();