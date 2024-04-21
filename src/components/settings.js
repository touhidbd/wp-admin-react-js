import React, {useState, useEffect} from "react";
import axios from "axios";

const Settings = () => {
    const [Apidata, setApiData] = useState([]);
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [notice, setNotice] = useState("d-none");
    const [formStatus, setFormStatus] = useState("");
    const [loader, setLoader] = useState("Save Settings");
    const [formNotice, setFormNotice] = useState("");
    const [tableList, setTableList] = useState("d-none");
    const [message, setMessage] = useState("");

    const url = `${appLocalizer.apiUrl}/wprest/v1/settings`;

    useEffect(() => {
        axios.get(url).then((res) => {
            setApiData(res.data);
            // console.log(res.data);
        });
    }, []);

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
    const handelSubmit = (e) => {
        e.preventDefault();
        const data = {
            firstname: firstname,
            lastname: lastname,
            email: email
        }
        setLoader("Saving...");
        fetch(`${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                response.json().then(Message => {
                    setFormNotice(Message.message);
                    if(Message.success) {
                        axios.get(url).then((res) => {
                            setApiData(res.data);
                        });
                        setTableList("d-block");
                    }
                    setFormStatus("d-none");
                    setNotice("d-block");
                });

            } else {
                setFormNotice("Failed to save settings");
            }
        }).catch(error => {
            console.error("Network error:", error);
        }).finally(() => {
            setLoader("Save Settings");
        });
    }

    const submitAgain = (e) => {
        e.preventDefault();
        document.getElementById("react-setting-form").reset();
        setNotice("d-none");
        setFormStatus("d-block");
    }

    return (
        <div>
            <div className={`react-form ${formStatus}`}>
                <form
                    id={'react-setting-form'}
                    onSubmit = {
                        (e) => {
                            handelSubmit(e);
                        }
                    }
                >
                    <input onChange={(e) => setFirstName(e.target.value)} type="text" name={'firstname'} placeholder={'First Name'}/>
                    <input onChange={(e) => setLastName(e.target.value)} type="text" name={'lastname'} placeholder={'Last Name'}/>
                    <div style={{ color: "red" }}><small>{message}</small></div>
                    <input onChange={(e) => { setEmail(e.target.value);  handleEmail(e)}} type="email" name={'email'} placeholder={'Email Address'}/>
                    <input type="submit" value={loader} />
                </form>
            </div>
            <div className={`all-list ${tableList}`}>
                <table>
                    <thead>
                        <tr>
                            <td>ID</td>
                            <td>First Name</td>
                            <td>Last Name</td>
                            <td>Email Address</td>
                            <td>Created Date</td>
                        </tr>
                    </thead>
                    <tbody>
                    {Apidata.map((user, index) => (
                        <tr key={index}>
                            <td>{user.id}</td>
                            <td>{user.firstname}</td>
                            <td>{user.lastname}</td>
                            <td>{user.email}</td>
                            <td>{user.created_date}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className={`react-form-notice ${notice}`}>
                <h2>{formNotice}</h2>
                <button className={'wp-element-button'} onClick={ (e) => { submitAgain(e); } }>Submit Again!</button>
            </div>
        </div>
    );
}

export default Settings;