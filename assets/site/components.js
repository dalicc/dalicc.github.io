/* SPDX-License-Identifier: AGPL-3.0-only
 * SPDX-FileCopyrightText: 2021-2026 DALICC - Verein zur Foerderung der Rechtssicherheit in der Datenbewirtschaftung (ZVR 1249185710)
 */
/* DALICC site: component behaviour.
 *
 * Public API (all under window.DALICC):
 *
 *   DALICC.disclaimer.open()      show the notice modal, where a page carries one
 *   DALICC.disclaimer.close()     hide it again
 *   DALICC.disclaimer.returnFocusTo(el)  where the focus goes when it closes
 *   DALICC.switches.value(name)   current value of a named tri-/two-state switch
 *   DALICC.switches.set(name, v)  set it programmatically
 *   DALICC.flash(message, kind)   append a flash message to [data-flash-region]
 *
 * A form with data-confirm="<question>" asks that question before it is sent, and
 * is not sent when the answer is no. Without JavaScript it is sent at once.
 *
 * Everything degrades: with JavaScript off the switches are plain radio groups
 * and checkboxes, the fieldsets are <details>, the tooltips work on hover, and
 * the disclaimer stays hidden (it never blocks the page).
 */
(function () {
  "use strict";

  var root = (window.DALICC = window.DALICC || {});

  /* ------------------------------------------------------------ disclaimer */

  var lastFocus = null;

  function panel() {
    return document.getElementById("disclaimer-overlay");
  }

  var disclaimer = {
    open: function () {
      var node = panel();
      if (!node) return;
      lastFocus = document.activeElement;
      node.hidden = false;
      var agree = node.querySelector("[data-disclaimer-agree]");
      if (agree) agree.focus();
    },
    close: function () {
      var node = panel();
      if (!node) return;
      node.hidden = true;
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    },
    /** A page that has something to focus while the dialog is open hands it over here,
     * so nothing behind the dialog takes the focus and the answer still gets it. */
    returnFocusTo: function (element) {
      lastFocus = element;
    }
  };
  root.disclaimer = disclaimer;

  function initDisclaimer() {
    var node = panel();
    if (!node) return;

    node.addEventListener("click", function (event) {
      if (event.target.closest("[data-disclaimer-agree]")) {
        event.preventDefault();
        disclaimer.close();
      }
    });

    // Keep focus inside the panel while it is open.
    node.addEventListener("keydown", function (event) {
      if (event.key !== "Tab" || node.hidden) return;
      var focusable = node.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    // Nothing is remembered: the tool pages carry a static note instead, and a page
    // that asks for the dialog to open by itself gets it on every visit.
    if (node.dataset.autoOpen === "true") {
      disclaimer.open();
    }
  }

  /* --------------------------------------------------------------- tooltips */

  function initTooltips() {
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      var open = document.querySelectorAll('.info__bubble[data-open="true"]');
      for (var i = 0; i < open.length; i += 1) {
        open[i].removeAttribute("data-open");
      }
    });

    // Touch devices get no :hover, so a tap toggles the bubble.
    document.addEventListener("click", function (event) {
      var button = event.target.closest(".info__btn");
      var opened = document.querySelectorAll('.info__bubble[data-open="true"]');
      for (var i = 0; i < opened.length; i += 1) {
        opened[i].removeAttribute("data-open");
      }
      if (!button) return;
      event.preventDefault();
      var bubble = button.parentNode.querySelector(".info__bubble");
      if (bubble && !opened.length) bubble.setAttribute("data-open", "true");
    });
  }

  /* --------------------------------------------------------------- switches */

  root.switches = {
    /** Current value of the switch group `name` (tri-state: string, duty: boolean). */
    value: function (name) {
      var checked = document.querySelector(
        '.switch3__input[name="' + CSS.escape(name) + '"]:checked'
      );
      if (checked) return checked.value;
      var box = document.querySelector('.switch2__input[name="' + CSS.escape(name) + '"]');
      if (box) return box.checked;
      return null;
    },
    /** Set the switch group `name` to `value`. */
    set: function (name, value) {
      var box = document.querySelector('.switch2__input[name="' + CSS.escape(name) + '"]');
      if (box) {
        box.checked = Boolean(value);
        box.dispatchEvent(new Event("change", { bubbles: true }));
        return;
      }
      var option = document.querySelector(
        '.switch3__input[name="' + CSS.escape(name) + '"][value="' + CSS.escape(value) + '"]'
      );
      if (option) {
        option.checked = true;
        option.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  };

  /* ----------------------------------------------------------------- flash */

  /**
   * Append a flash message. `kind` is one of info | success | warning | error.
   * The text is inserted as a text node, never as HTML.
   */
  root.flash = function (message, kind) {
    var region = document.querySelector("[data-flash-region]");
    if (!region) return null;
    var box = document.createElement("div");
    box.className = "flash flash--" + (kind || "info");
    box.setAttribute("role", kind === "error" ? "alert" : "status");
    var body = document.createElement("div");
    body.className = "flash__body";
    var paragraph = document.createElement("p");
    paragraph.style.margin = "0";
    paragraph.appendChild(document.createTextNode(String(message)));
    body.appendChild(paragraph);
    box.appendChild(body);
    region.appendChild(box);
    return box;
  };

  /* ---------------------------------------------------------- confirmations */

  /**
   * Ask before a form that deletes, revokes, withdraws or hands something over is
   * sent. The question sits on the form as data-confirm, written for that action:
   * what happens and what stops working. One listener on the document covers every
   * form, including the ones a page adds later.
   */
  function initConfirmations() {
    document.addEventListener(
      "submit",
      function (event) {
        var form = event.target;
        if (!form || !form.getAttribute) return;
        var question = form.getAttribute("data-confirm");
        if (!question) return;
        if (!window.confirm(question)) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      true
    );
  }

  /* ------------------------------------------------------------ result notice */

  /**
   * Focus the notice a page rendered next to the control that was used.
   *
   * A form on a long page answers with the page again, and the answer sits in the
   * section of that form, marked data-result-notice and tabindex="-1". Focusing it
   * brings it into view and puts a keyboard or screen reader user on it, instead of
   * at the top of the page. Behind an open disclaimer dialog nothing is focused; the
   * dialog hands the focus over when it closes.
   */
  function initResultNotice() {
    var notice = document.querySelector("[data-result-notice]");
    if (!notice || !notice.querySelector(".flash")) return;
    var overlay = panel();
    if (overlay && !overlay.hidden) {
      disclaimer.returnFocusTo(notice);
      return;
    }
    notice.focus();
    // A page opened at a section (#people-heading) scrolls there once it has loaded,
    // and the browser hands the focus back to the page while it does; the notice
    // takes it again right after.
    window.addEventListener("load", function () {
      window.setTimeout(function () {
        if (document.activeElement === document.body) notice.focus({ preventScroll: true });
      }, 0);
    });
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    initDisclaimer();
    initTooltips();
    initConfirmations();
    initResultNotice();
  });
})();
