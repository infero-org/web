import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

// The contact form has no backend yet: it only validates required fields client-side, drops the submission
// silently if the honeypot was filled in, and otherwise swaps itself for a success message. These pin that.
const open = () => {
  const { window } = new JSDOM(readFileSync(new URL('../index.html', import.meta.url), 'utf8'), {
    runScripts: 'dangerously',
    beforeParse(w) {
      w.matchMedia = query => ({ matches: query.includes('scripting') });
      w.IntersectionObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    },
  });
  const form = window.document.getElementById('contact-form');
  const success = window.document.getElementById('contact-success');
  const submit = () => form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  const fillValid = () => {
    form.elements.name.value = 'Jan Novák';
    form.elements.email.value = 'jan@example.com';
    form.elements.phone.value = '+420 777 123 456';
  };
  return { window, form, success, submit, fillValid };
};

test('name, email and phone are required with sensible input types; company and message are optional', () => {
  const { form } = open();
  assert.equal(form.elements.name.required, true);
  assert.equal(form.elements.email.required, true);
  assert.equal(form.elements.email.type, 'email');
  assert.equal(form.elements.phone.required, true);
  assert.equal(form.elements.phone.type, 'tel');
  assert.equal(form.elements.company.required, false);
  assert.equal(form.elements.message.required, false);
});

test('submitting with required fields empty is blocked, shows inline errors, and focuses the first invalid field', () => {
  const { window, form, success, submit } = open();
  submit();
  assert.equal(success.hidden, true);
  assert.equal(form.hidden, false);
  assert.equal(form.elements.name.getAttribute('aria-invalid'), 'true');
  assert.ok(window.document.getElementById('cf-name-error').textContent.length > 0);
  assert.equal(window.document.activeElement, form.elements.name);
});

test('a phone number that fails the E.164 format check is blocked with its own error, even once other fields are valid', () => {
  const { window, form, success, submit, fillValid } = open();
  fillValid();
  form.elements.phone.value = 'call me maybe';
  submit();
  assert.equal(success.hidden, true);
  assert.equal(form.hidden, false);
  assert.equal(form.elements.name.getAttribute('aria-invalid'), null);
  assert.equal(form.elements.phone.getAttribute('aria-invalid'), 'true');
  assert.ok(window.document.getElementById('cf-phone-error').textContent.length > 0);
  assert.equal(window.document.activeElement, form.elements.phone);
});

test('a filled honeypot field drops the submission silently, even with valid fields', () => {
  const { form, success, submit, fillValid } = open();
  fillValid();
  form.elements.url.value = 'http://spam.example';
  submit();
  assert.equal(success.hidden, true);
  assert.equal(form.hidden, false);
});

test('a valid submission with an empty honeypot swaps the form for the success message, and focuses it', () => {
  const { window, form, success, submit, fillValid } = open();
  fillValid();
  submit();
  assert.equal(form.hidden, true);
  assert.equal(success.hidden, false);
  assert.equal(window.document.activeElement, success);
});
