'use client';
import { useState, useRef } from 'react';
import { Main } from '@/components';
import emailjs from '@emailjs/browser';

export default function Contact() {
    const form = useRef();
    const [messageSent, setMessageSent] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [disableButton, setDisableButton] = useState(false);
    const [noForm, setNoForm] = useState(0);

    const sendEmail = (e) => {
        e.preventDefault();
        const name = form.current.name.value.trim();
        const email = form.current.email.value.trim();
        const message = form.current.message.value.trim();    

        if (!name && !email && !message && noForm < 10) {
            setMessageSent(false);
            setErrorMessage("fill out the form :(");
            setNoForm(prevNoForm => prevNoForm + 1);
            console.log(noForm);
            return;
        }

        if (!name && !email && !message && (10 <= noForm && noForm < 20)) {
            setMessageSent(false);
            setErrorMessage("are we really doing this again?");
            setNoForm(prevNoForm => prevNoForm + 1);
            console.log(noForm);
            return;
        }

        if (!name && !email && !message && (20 <= noForm && noForm < 30)) {
            setMessageSent(false);
            setErrorMessage("i'm not playing this game anymore.");
            setNoForm(prevNoForm => prevNoForm + 1);
            console.log(noForm);
            return;
        }

        if (!name && !email && !message && (30 <= noForm && noForm < 40)) {
            setMessageSent(false);
            setErrorMessage("bye!");
            setNoForm(prevNoForm => prevNoForm + 1);
            console.log(noForm);
            return;
        }

        if (!name && !email && !message && (noForm == 40)) {
            setMessageSent(false);
            setErrorMessage(":)");
            return;
        }

        if (!name) {
            setMessageSent(false);
            setErrorMessage("please enter a name!");
            return;
        }

        if (!email) {
            setMessageSent(false);
            setErrorMessage("please enter an email!");
            return;
        }

        if (!message) {
            setMessageSent(false);
            setErrorMessage("please enter a message!");
            return;
        }

        if (!email.includes("@") || !email.includes(".")) {
            setMessageSent(false);
            setErrorMessage("please enter a valid email!");
            return;
        }

        if (!name.match(/^[a-zA-Z\s]+$/)) {
            setMessageSent(false);
            setErrorMessage("invalid name. name should only contain letters and spaces.");
            return;
        }

        setDisableButton(true);

        emailjs.sendForm("service_e5x1bvy", "template_5lgmdyl", form.current, "CpWSL1rk6KmFcj2gi")
            .then(() => {
                setMessageSent(true);
                setErrorMessage("");
                setDisableButton(false);
            }, () => {
                setMessageSent(false);
                setErrorMessage("something went wrong. please try again later");
                setDisableButton(false);
            });
    };

    return (
        <Main>
            <h1 className="text-[1.05rem]/[1.75rem] sm:text-lg mb-4">shoot me an email below!</h1>

            <form ref={form} onSubmit={sendEmail} className="space-y-4 text-black">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Name</label>
                    <input type="text" name="name" className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-400">Email</label>
                    <input type="email" name="email" className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-400">Message</label>
                    <textarea className="resize-none mt-1 p-2 border border-gray-300 rounded-md w-full h-32" name="message" />
                </div>
                
                <div>
                    <button type="submit"
                        disabled={disableButton}
                        className={`bg-green-500 text-white px-4 py-2 rounded-md transition duration-300 ${disableButton ? 'bg-red-500 disabled' : 'hover:bg-green-800 hover:text-white'}`}
                    >
                        {disableButton ? "Sending" : "Send"}
                    </button>
                </div>
            </form>

            {messageSent && (
                <div className="text-green-700 px-4 mt-2 py-2 rounded-md">
                    Message sent! I will get back to you soon :D
                </div>
            )}

            {(errorMessage && noForm < 40) ? (
                <div className="text-red-500 px-4 mt-2 py-2 rounded-md">
                    {errorMessage}
                </div>
            ) : noForm == 40 ? (
                <div className="text-red-500 px-4 mt-2 py-2 rounded-md">
                    {errorMessage}
                    <iframe
                        className="rounded-md w-[300px] h-[250px] sm:w-[500px] sm:h-[360px]"
                        loading="lazy"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
                ) : null}
        </Main>
    );
}
