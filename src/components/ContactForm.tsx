"use client";

import React, { useState } from "react";

export type ContactFormValues = {
  name: string;
  email: string;
  photographyType: string;
  preferredDate: string;
  message: string;
};

const photographyTypes = ["Graduation", "Events", "Headshots", "Portraits", "Groups"];
const initialValues: ContactFormValues = {
  name: "",
  email: "",
  photographyType: photographyTypes[0],
  preferredDate: "",
  message: ""
};

export function ContactForm({ onSubmit }: { onSubmit: (values: ContactFormValues) => Promise<void> }) {
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof ContactFormValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await onSubmit(values);
      setValues(initialValues);
      setHasSubmitted(true);
    } catch {
      setError("Something went wrong sending your inquiry. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>
        Name
        <input
          name="name"
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
          required
        />
      </label>
      <label>
        Email
        <input
          name="email"
          type="email"
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          required
        />
      </label>
      <label>
        Photography type
        <select
          name="photographyType"
          value={values.photographyType}
          onChange={(event) => updateField("photographyType", event.target.value)}
        >
          {photographyTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label>
        Preferred date
        <input
          name="preferredDate"
          type="date"
          value={values.preferredDate}
          onChange={(event) => updateField("preferredDate", event.target.value)}
        />
      </label>
      <label className="contact-form-message">
        Message
        <textarea
          name="message"
          value={values.message}
          onChange={(event) => updateField("message", event.target.value)}
          rows={6}
          required
        />
      </label>
      <button className="dark-button" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send inquiry"}
      </button>
      {error ? (
        <p className="form-error" role="status">
          {error}
        </p>
      ) : null}
      {hasSubmitted && !error ? (
        <p className="form-success" role="status">
          Inquiry sent. We will review the details and follow up soon.
        </p>
      ) : null}
    </form>
  );
}
