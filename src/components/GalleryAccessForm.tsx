"use client";

import React, { FormEvent, useState } from "react";
import type { Gallery } from "@/lib/types";

type GalleryAccessFormValues = {
  passcode: string;
  email: string;
};

type GalleryAccessFormProps = {
  gallery: Gallery;
  error: string | null;
  onSubmit: (values: GalleryAccessFormValues) => void;
};

export function GalleryAccessForm({ gallery, error, onSubmit }: GalleryAccessFormProps) {
  const [passcode, setPasscode] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ passcode, email });
  }

  return (
    <form className="access-form" onSubmit={handleSubmit}>
      <label>
        <span>Passcode</span>
        <input
          type="password"
          name="passcode"
          value={passcode}
          autoComplete="current-password"
          onChange={(event) => setPasscode(event.target.value)}
        />
      </label>
      {gallery.requiresApprovedEmail ? (
        <label>
          <span>Approved email</span>
          <input
            type="email"
            name="email"
            value={email}
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}
      <button className="dark-button" type="submit">
        Open Gallery
      </button>
    </form>
  );
}
