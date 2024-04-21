import React, {useState, useEffect} from "react";
import axios from "axios";

const AdminSettings = () => {
    const [Apidata, setApiData] = useState([]);
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [notice, setNotice] = useState("d-none");
    const [formStatus, setFormStatus] = useState("");
    const [loader, setLoader] = useState("Save Settings");
    const [formNotice, setFormNotice] = useState("");
    const [message, setMessage] = useState("");
    const [editData, setEditData] = useState("false");
    const [editDataId, setEditDataId] = useState("");
    const [deleteNotice, setDeleteNotice] = useState("d-block");
    const [dataLoader, setDataLoader] = useState("d-none");

    const url = `${appLocalizer.apiUrl}/wprest/v1/settings`;

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        setDataLoader("d-block");
        axios.get(url).then((res) => {
            setApiData(res.data.results);
            setTotalPages(res.data.total_pages);
            setTotalResults(res.data.total_results);
            setDataLoader("d-none");
        });
    }, []);

    function handlePageChange(page) {
        setCurrentPage(page);
        setDataLoader("d-block");
        axios.get(`${url}?page=${currentPage}`).then((res) => {
            setApiData(res.data.results);
            setDataLoader("d-none");
        });
    }

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            const buttonClass = currentPage === i ? 'active' : '';
            pages.push(
                <button className={buttonClass} key={i} onClick={() => handlePageChange(i)}>
                    {i}
                </button>
            );
        }
        return pages;
    };

    function handleEmail(e) {
        let inputValue = e.target.value;
        setEmail(inputValue);

        let emailRegex = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
        if (!emailRegex.test(inputValue)) {
            setMessage("Error! you have entered invalid email.");
        } else {
            setMessage("");
        }
    }

    let fetchUrl = url;
    if(editData === 'true') {
        fetchUrl = `${appLocalizer.apiUrl}/wprest/v1/settings/update/${editDataId}`;
    }
    const handelSubmit = (e) => {
        e.preventDefault();
        const data = {
            firstname: firstname,
            lastname: lastname,
            email: email
        }
        setLoader("Saving...");
        fetch(`${fetchUrl}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                response.json().then(Message => {
                    setFormNotice(Message.message);
                    setDataLoader("d-block");
                    if(Message.success) {
                        axios.get(url).then((res) => {
                            setApiData(res.data.results);
                            setDataLoader("d-none");
                        });
                    }
                    setFormStatus("d-none");
                    setNotice("d-block");
                    setDeleteNotice("d-block");
                });

            } else {
                setFormNotice("Failed to save User Data");
            }
        }).catch(error => {
            console.error("Network error:", error);
        }).finally(() => {
            setLoader("Save User Data");
        });
    }

    const submitAgain = (e) => {
        e.preventDefault();
        document.getElementById("react-admin-form").reset();
        setFirstName("");
        setLastName("");
        setEmail("");
        setNotice("d-none");
        setFormStatus("d-block");
    }

    function handelEdit(e) {
        e.preventDefault();
        window.scrollTo(0, 0);
        const editUrl = `${appLocalizer.apiUrl}/wprest/v1/settings/update/${e.target.value}`;
        axios.get(editUrl).then((res) => {
            const userData = res.data[0];
            setFirstName(userData.firstname);
            setLastName(userData.lastname);
            setEmail(userData.email);
            setEditDataId(e.target.value);
            setLoader("Update User Data");
            setEditData("true");
        }).catch((error) => {
            console.error('Error fetching user data:', error);
        });
    }

    function handelDelete(e) {
        e.preventDefault();
        const deleteUrl = `${appLocalizer.apiUrl}/wprest/v1/settings/delete/${e.target.value}`;
        if (window.confirm('Are you sure you want to delete this user data?')) {
            fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .then(response => {
                if (response.ok) {
                    response.json().then(Message => {
                        setFormNotice(Message.message);
                        setNotice("d-block");
                        setDeleteNotice("d-none");
                        window.scrollTo(0, 0);
                        setFormStatus("d-block");
                        axios.get(url).then((res) => {
                            setApiData(res.data.results);
                        });
                    });
                } else {
                    console.error('Failed to delete record.');
                }
            })
            .catch(error => {
                console.error('Error deleting record:', error);
            });
        }
    }

    return (
        <div>
            <div className={`react-form-notice ${notice}`}>
                <p>{formNotice}</p>
                <button className={`button button-primary ${deleteNotice}`} onClick={ (e) => { submitAgain(e); } }>Submit Again!</button>
            </div>
            <div className={`react-admin-form ${formStatus}`}>
                <form
                    id={'react-admin-form'}
                    onSubmit = {
                        (e) => {
                            handelSubmit(e);
                        }
                    }
                >
                    <table className="form-table" role="presentation">
                        <tbody>
                            <tr>
                                <th scope="row">
                                    <label htmlFor="firstname">First Name</label>
                                </th>
                                <td>
                                    <input value={firstname} onChange={(e) => setFirstName(e.target.value)}  className="regular-text" type="text" id="firstname" placeholder="First Name"/>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label htmlFor="lastname">Last Name</label>
                                </th>
                                <td>
                                    <input value={lastname} onChange={(e) => setLastName(e.target.value)} className="regular-text" type="text" id="lastname" placeholder="Last Name"/>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label htmlFor="email">Email Address</label>
                                </th>
                                <td>
                                    <input value={email} onChange={(e) => { setEmail(e.target.value);  handleEmail(e)}}  className="regular-text" type="email" id="email" placeholder="Email Address"/>
                                    <div style={{ color: "red" }}><small>{message}</small></div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="submit">
                        <input type="submit" name="submit" id="submit" className="button button-primary" value={loader}/>
                    </p>
                </form>
            </div>
            <div className={`all-list`}>
                <table className={`wp-list-table widefat fixed striped table-view-list posts`}>
                    <thead>
                        <tr>
                            <td>First Name</td>
                            <td>Last Name</td>
                            <td>Email Address</td>
                            <td>Created Date</td>
                            <td>Action</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={5} className={`text-center p-0`}>
                                <div className={dataLoader}>
                                    <div className="lds-roller">
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                    </div>
                                </div>
                            </td>
                        </tr>

                        {Apidata.map((user, index) => (
                        <tr key={index}>
                            <td>{user.firstname}</td>
                            <td>{user.lastname}</td>
                            <td>{user.email}</td>
                            <td>{user.created_date}</td>
                            <td>
                                <button onClick={(e) => { handelDelete(e) }} className={`button button-primary`} value={user.id}>Delete</button>
                                <button onClick={(e) => { handelEdit(e) }} className={`button button-secondary`} value={user.id}>Edit</button>
                            </td>
                        </tr>
                        ))}

                    </tbody>
                </table>
                <div className="pagination">
                    <div className="pagination-top">
                        <div className="total-page">Total Items: <b>{totalResults}</b></div>
                        <div className="pagination-list">
                            <button onClick={(e) => { e.preventDefault(); handlePageChange( currentPage - 1 ) }} disabled={currentPage === 1}>
                                {'<'}
                            </button>
                            { renderPagination() }
                            <button onClick={(e) => { e.preventDefault(); handlePageChange( currentPage + 1 ) }} disabled={currentPage === totalPages}>
                                {'>'}
                            </button>
                        </div>
                        <div className="total-page"><b>{currentPage}</b> of <b>{totalPages}</b></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default AdminSettings;