"use client";

import { LOCATION_OPTIONS } from "@/lib/countries";

// A location field with a dropdown of suggestions that still accepts any
// free-text value — so nobody is locked out if their location isn't listed.
export default function LocationInput({ id, value, onChange, placeholder = "Start typing…" }) {
  const listId = `${id}-options`;
  return (
    <>
      <input
        id={id}
        className="field"
        list={listId}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="off"
      />
      <datalist id={listId}>
        {LOCATION_OPTIONS.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
}
