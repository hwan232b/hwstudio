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

export function ContactForm({ onSubmit }: { onSubmit: (values: ContactFormValues) => void }) {
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  function updateField(field: keyof ContactFormValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(values);
    setValues(initialValues);
    setHasSubmitted(true);
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
      <button className="dark-button" type="submit">
        Send inquiry
      </button>
      {hasSubmitted ? (
        <p className="form-success" role="status">
          Inquiry sent. We will review the details and follow up soon.
        </p>
      ) : null}
    </form>
  );
}
