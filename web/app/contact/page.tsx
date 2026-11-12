"use client";

import { useRef, useState, useTransition } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://api.localhost:8080"
    : "https://api.andrearcaina.ca");

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [messageSent, setMessageSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const sendEmail = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formRef.current) return;

    const form = new FormData(formRef.current);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();

    if (!name || !email || !message) {
      setMessageSent(false);
      setErrorMessage("please fill out all three fields.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setMessageSent(false);
      setErrorMessage("please use a valid email address.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Something went wrong.");
        }

        setMessageSent(true);
        setErrorMessage("");
        formRef.current?.reset();
      } catch (error) {
        setMessageSent(false);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "something went wrong. please try again later.",
        );
      }
    });
  };

  return (
    <div className="site-page">
      <div className="contact-layout">
        <header className="page-intro">
          <p className="page-label">contact</p>
          <h1 className="page-title">say hello</h1>
          <p className="page-summary">
            Send a message here, or reach me at{" "}
            <span className="contact-email">dtandre331 [at] gmail [dot] com.</span>
          </p>
        </header>

        <form ref={formRef} className="contact-form" onSubmit={sendEmail}>
          <div className="contact-field">
            <label htmlFor="name">name</label>
            <input id="name" name="name" autoComplete="name" placeholder="your name" />
          </div>
          <div className="contact-field">
            <label htmlFor="email">email</label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="contact-field">
            <label htmlFor="message">message</label>
            <textarea id="message" name="message" placeholder="what&apos;s up?" />
          </div>
          <button className="contact-submit" type="submit" disabled={isPending}>
            {isPending ? (
              "sending…"
            ) : (
              <>
                <span>send message</span> <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>

        {messageSent && (
          <p className="mt-6 text-sm text-primary" role="status">
            message sent. i&apos;ll get back to you soon.
          </p>
        )}
        {errorMessage && (
          <p className="mt-6 text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
