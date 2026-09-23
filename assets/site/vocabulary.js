/* SPDX-License-Identifier: AGPL-3.0-only
 * SPDX-FileCopyrightText: 2021-2026 DALICC - Verein zur Foerderung der Rechtssicherheit in der Datenbewirtschaftung (ZVR 1249185710)
 */
/*
 * vocabulary.js -- progressive enhancement for the /ns vocabulary page.
 *
 * Two jobs:
 *   1. "Copy" next to every term IRI puts the IRI on the clipboard.
 *   2. A term reached through its fragment (/ns#promote, or the 303 from /ns/promote)
 *      is highlighted briefly, so the reader sees which of the 40-odd cards was meant.
 *
 * The page is complete without this file: the IRI is selectable text and the anchors
 * work on their own.
 */
(function () {
  "use strict";

  var RESET_DELAY = 1600;

  function announce(button, text) {
    var original = button.dataset.originalLabel || button.textContent;
    button.dataset.originalLabel = original;
    button.textContent = text;
    button.dataset.copied = "true";
    window.setTimeout(function () {
      button.textContent = button.dataset.originalLabel;
      button.removeAttribute("data-copied");
    }, RESET_DELAY);
  }

  function copyFallback(value) {
    // clipboard.writeText needs a secure context; a plain-HTTP deployment gets this.
    var field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "readonly");
    field.style.position = "fixed";
    field.style.top = "-1000px";
    document.body.appendChild(field);
    field.select();
    var copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    document.body.removeChild(field);
    return copied;
  }

  function onCopyClick(button) {
    var value = button.getAttribute("data-copy");
    if (!value) {
      return;
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(
        function () {
          announce(button, "Copied");
        },
        function () {
          announce(button, copyFallback(value) ? "Copied" : "Press Ctrl+C");
        }
      );
      return;
    }
    announce(button, copyFallback(value) ? "Copied" : "Press Ctrl+C");
  }

  function highlightTarget() {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) {
      return;
    }
    var target;
    try {
      target = document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch (error) {
      return;
    }
    if (!target || !target.classList.contains("term-card")) {
      return;
    }
    target.setAttribute("data-targeted", "true");
    window.setTimeout(function () {
      target.removeAttribute("data-targeted");
    }, 2400);
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-copy]");
    if (button) {
      onCopyClick(button);
    }
  });

  window.addEventListener("hashchange", highlightTarget);
  highlightTarget();
})();
