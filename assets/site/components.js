/* SPDX-License-Identifier: AGPL-3.0-only
 * SPDX-FileCopyrightText: 2021-2026 DALICC - Verein zur Foerderung der Rechtssicherheit in der Datenbewirtschaftung (ZVR 1249185710)
 */
/* DALICC site: component behaviour.
 *
 * Public API (all under window.DALICC):
 *
 *   DALICC.disclaimer.open()      show the experimental-service modal
 *   DALICC.disclaimer.close()     hide it and remember the acknowledgement
 *   DALICC.disclaimer.reset()     forget the acknowledgement (testing)
 *   DALICC.switches.value(name)   current value of a named tri-/two-state switch
 *   DALICC.switches.set(name, v)  set it programmatically
 *   DALICC.flash(message, kind)   append a flash message to [data-flash-region]
 *
 * Everything degrades: with JavaScript off the switches are plain radio groups
 * and checkboxes, the fieldsets are <details>, the tooltips work on hover, and
 * the disclaimer stays hidden (it never blocks the page).
 */
(function () {
  "use strict";

  var root = (window.DALICC = window.DALICC || {});

  /* ------------------------------------------------------------ disclaimer */

  var DISCLAIMER_KEY = "dalicc.disclaimer.ack";
  var lastFocus = null;

  function panel() {
    return document.getElementById("disclaimer-overlay");
  }

  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      /* private mode / blocked storage: the modal simply shows again */
    }
  }

  function storageRemove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      /* ignore */
    }
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
      storageSet(DISCLAIMER_KEY, "1");
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    },
    reset: function () {
      storageRemove(DISCLAIMER_KEY);
    },
    acknowledged: function () {
      return storageGet(DISCLAIMER_KEY) === "1";
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

    if (node.dataset.autoOpen === "true" && !disclaimer.acknowledged()) {
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
  });
})();
