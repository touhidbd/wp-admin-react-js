<?php
/*
Plugin Name: WP Admin React JS
Plugin URI: https://tcoderbd.com
Description: WordPress Admin with React JS
Version: 1.0.0
Requires at least: 5.8
Requires PHP: 5.6.20
Author: Touhidul Sadeek
Author URI: https://tcoderbd.com
License: GPLv2 or later
Text Domain: wp-admin-react-js
*/

if( ! defined('ABSPATH') ) { exit(); }

/*
 * Define Plugin Contents
 * */
define ( 'WPAR_PATH', trailingslashit( plugin_dir_path( __FILE__ ) ) );
define ( 'WPAR_URL', trailingslashit( plugins_url( '/', __FILE__ ) ) );

/*
 * Load Scripts
 * */
function wpreact_load_scripts(){
	wp_enqueue_style('wpreactjs', WPAR_URL .'build/style-index.css', array(), wp_rand() );
	wp_enqueue_script( 'wpreactjs', WPAR_URL . 'build/index.js', [ 'jquery', 'wp-element' ], wp_rand(), true );
	wp_localize_script( 'wpreactjs', 'appLocalizer', [
		'apiUrl' => home_url('/wp-json'),
		'nonce' => wp_create_nonce('wp_rest')
	] );
}
add_action('wp_enqueue_scripts','wpreact_load_scripts');

function admin_wpreact_load_scripts(){
	wp_enqueue_style('wpreactjs', WPAR_URL .'admin/build/style-index.css', array(), wp_rand() );
	wp_enqueue_script( 'wpreactjs', WPAR_URL . 'admin/build/index.js', [ 'jquery', 'wp-element' ], wp_rand(), true );
	wp_localize_script( 'wpreactjs', 'appLocalizer', [
			'apiUrl' => esc_url_raw( rest_url() ),
			'nonce' => wp_create_nonce('wp_rest')
	] );
}
add_action('admin_enqueue_scripts','admin_wpreact_load_scripts');

function wpreactjs_table_init() {
	global $wpdb;
	$charset_collate = $wpdb->get_charset_collate();
	$table_name = $wpdb->prefix. 'react_user_data';
	$sql = "CREATE TABLE {$table_name} (
				`id` INT NOT NULL AUTO_INCREMENT,
				`firstname` VARCHAR(250),
				`lastname` VARCHAR(250),
				`email` VARCHAR(250),
				`created_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(), 
				PRIMARY KEY (id)
			) $charset_collate";

	require_once ABSPATH . "wp-admin/includes/upgrade.php";
	dbDelta ($sql);
}
register_activation_hook(__FILE__, 'wpreactjs_table_init');

function reactwp_custom_settings_page() {
	add_menu_page(
		'WP Admin ReactJS',
		'WP Admin ReactJS',
		'manage_options',
		'wp-admin-react-js',
		'custom_settings_page_content',
		'dashicons-buddicons-community',
		100
	);
}
add_action('admin_menu', 'reactwp_custom_settings_page');

function custom_settings_page_content() {
	?>
	<div class="wrap">
		<h2>Custom Settings</h2>
		<div id="react_wp_admin"></div>
	</div>
	<?php
}

require_once WPAR_PATH . 'classes/reset-api-create.php';