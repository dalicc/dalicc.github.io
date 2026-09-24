/* SPDX-License-Identifier: AGPL-3.0-only
 * SPDX-FileCopyrightText: 2021-2026 DALICC - Verein zur Foerderung der Rechtssicherheit in der Datenbewirtschaftung (ZVR 1249185710)
 */
/* DALICC site: page chrome behaviour.
 *
 * Vanilla ES2020, no dependencies, no inline handlers. Everything here is a
 * progressive enhancement: the navigation opens with a checkbox and the page is
 * fully usable with JavaScript disabled.
 */
(function () {
  "use strict";

  var root = (window.DALICC = window.DALICC || {});

  /* ---------------------------------------------------------- navigation */

  /**
   * The Menu button of the drawer (1024px and below).
   *
   * Without JavaScript the drawer is a checkbox and its label: it opens, but a screen
   * reader announces a checkbox and Enter does nothing. With JavaScript the label is
   * replaced by a real button that says whether the drawer is open (aria-expanded)
   * and which element it opens (aria-controls); the checkbox stays as the state the
   * CSS reads, out of the tab order and out of the accessibility tree. Above 1024px
   * the CSS hides both, so neither is a tab stop there.
   */
  function initNav() {
    var toggle = document.getElementById("nav-toggle");
    var label = document.querySelector(".nav-toggle__label");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !label || !nav) return;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "nav-toggle__label nav-toggle__button";
    button.setAttribute("aria-controls", nav.id || "site-nav");
    while (label.firstChild) button.appendChild(label.firstChild);
    label.parentNode.replaceChild(button, label);
    toggle.setAttribute("tabindex", "-1");
    toggle.setAttribute("aria-hidden", "true");

    function sync() {
      button.setAttribute("aria-expanded", toggle.checked ? "true" : "false");
    }

    function set(open) {
      toggle.checked = open;
      sync();
    }

    button.addEventListener("click", function () {
      set(!toggle.checked);
    });
    toggle.addEventListener("change", sync);
    sync();

    // Escape closes the drawer and returns focus to the button.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.checked) {
        set(false);
        button.focus();
      }
    });

    // Close the drawer when a link inside it is followed.  The caret buttons are not
    // links and are hidden in the drawer, so they never close it.
    nav.addEventListener("click", function (event) {
      if (closestElement(event.target, "a") && toggle.checked) set(false);
    });
  }

  /* ------------------------------------------------- menu drop-downs (wide) */

  /** `Element.closest` for an event target that may not be an element at all. */
  function closestElement(target, selector) {
    return target && target.closest ? target.closest(selector) : null;
  }

  /**
   * The group drop-downs, one behaviour per kind of device.
   *
   * Where a pointer can hover, the drop-down is the pointer's: the CSS opens it on
   * `:hover` and on `:focus-within` and closes it again when the pointer leaves, and
   * the chevron is only the sign that the group has pages under it.  It takes no
   * click, it is not in the tab order and it is not announced, so a visitor can never
   * leave a menu standing open and then wonder why it is stuck.
   *
   * Where there is no hover, a touch screen at desktop width, none of that is
   * available: there the chevron is a real button that opens the drop-down without
   * leaving the page, says whether it is open, and keeps it open until a tap outside
   * or Escape, which is what a visitor expects of a menu they tapped.  The group
   * label is a link to the group's landing page on both.
   *
   * The markup is the same either way.  This function reads
   * `matchMedia("(hover: hover)")`, sets the attributes that go with the answer and
   * listens for the answer changing under it, which happens when a keyboard is
   * attached to a tablet or taken off again.  With JavaScript off, the chevron stays
   * as the template renders it, decoration, and hover and the keyboard still open
   * every drop-down.
   */
  function initNavDropdowns() {
    var carets = document.querySelectorAll(".site-nav__caret");
    if (!carets.length) return;

    // True while the device has a pointer that can hover.  It is a live query, so it
    // answers again after the visitor attaches a mouse or folds a keyboard away.
    var hoverPointer = window.matchMedia("(hover: hover)");

    // The item Escape was pressed on.  Its drop-down stays shut while the focus is
    // still inside it, because the focus Escape returns to is inside the item and
    // :focus-within would otherwise reopen what the visitor just closed.
    var dismissed = null;

    function undismiss() {
      if (!dismissed) return;
      dismissed.classList.remove("site-nav__item--dismissed");
      dismissed = null;
    }

    function close(item) {
      item.classList.remove("site-nav__item--open");
      var caret = item.querySelector(".site-nav__caret");
      if (caret) caret.setAttribute("aria-expanded", "false");
    }

    function closeAll(except) {
      var open = document.querySelectorAll(".site-nav__item--open");
      for (var i = 0; i < open.length; i += 1) {
        if (open[i] !== except) close(open[i]);
      }
    }

    /**
     * Give every chevron the role this device needs.
     *
     * Decoration where the pointer can hover: out of the tab order and out of the
     * accessibility tree, because the group label already leads to every page the
     * drop-down lists.  A button where it cannot, with the state a screen reader
     * reads.  The template renders the decorative form, so a page whose script has
     * not run yet is the quiet one.
     */
    function syncCarets() {
      var decorative = hoverPointer.matches;
      Array.prototype.forEach.call(carets, function (caret) {
        if (decorative) {
          caret.setAttribute("aria-hidden", "true");
          caret.setAttribute("tabindex", "-1");
        } else {
          caret.removeAttribute("aria-hidden");
          caret.removeAttribute("tabindex");
        }
      });
      // A menu opened by a tap must not survive a mouse being plugged in, where
      // nothing would ever close it again.
      if (decorative) {
        closeAll(null);
        undismiss();
      }
    }

    Array.prototype.forEach.call(carets, function (caret) {
      caret.addEventListener("click", function () {
        // Where the pointer can hover the chevron opens nothing; the CSS also stops
        // it taking the click at all, and this is the same answer from the script.
        if (hoverPointer.matches) return;
        var item = caret.closest(".site-nav__item");
        if (!item) return;
        var opened = !item.classList.contains("site-nav__item--open");
        undismiss();
        closeAll(item);
        item.classList.toggle("site-nav__item--open", opened);
        caret.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    });

    // A click anywhere else closes the open drop-down, including a click on another
    // group's label.
    document.addEventListener("click", function (event) {
      if (!closestElement(event.target, ".site-nav__item--open")) closeAll(null);
    });

    // Escape closes it and gives the focus back to the part of the entry the visitor
    // reached it from, so the keyboard never lands somewhere invisible: the group
    // label where the chevron is decoration, the chevron where it is the button.
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      var item = document.querySelector(".site-nav__item--open, .site-nav__item:focus-within");
      if (!item) return;
      var caret = item.querySelector(".site-nav__caret");
      // In the drawer the caret is hidden and the children are listed under the label
      // all the time, so there is no drop-down to close and nothing to dismiss.
      if (!caret || window.getComputedStyle(caret).display === "none") return;
      closeAll(null);
      undismiss();
      dismissed = item;
      item.classList.add("site-nav__item--dismissed");
      var target = hoverPointer.matches ? item.querySelector(".site-nav__link") : caret;
      if (target && target.focus) target.focus();
    });

    // Tabbing out of a group closes it behind you, and a group the visitor tabs into
    // is no longer the one they dismissed.
    document.addEventListener("focusin", function (event) {
      var item = closestElement(event.target, ".site-nav__item");
      closeAll(item);
      if (item !== dismissed) undismiss();
    });

    // Moving the pointer onto another group clears a dismissal that is no longer
    // about the menu the visitor is reading.
    document.addEventListener("mouseover", function (event) {
      var item = closestElement(event.target, ".site-nav__item");
      if (item && item !== dismissed) undismiss();
    });

    if (hoverPointer.addEventListener) {
      hoverPointer.addEventListener("change", syncCarets);
    } else if (hoverPointer.addListener) {
      // Safari before 14 knows the query but not the event listener.
      hoverPointer.addListener(syncCarets);
    }
    syncCarets();
  }

  /* --------------------------------------------------------- back to top */

  function initBackToTop() {
    var button = document.querySelector(".back-to-top");
    if (!button) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    function update() {
      button.dataset.visible = window.scrollY > 600 ? "true" : "false";
    }
    window.addEventListener("scroll", update, { passive: true });
    update();

    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce.matches ? "auto" : "smooth" });
      var skip = document.querySelector(".skip-link");
      if (skip) skip.focus();
    });
  }

  /* ------------------------------------------------- the one-off secret box */

  /**
   * "Copy" on a value that is shown exactly once: a new API token, an invitation
   * link, a temporary password.
   *
   * The value is read out of the code element of the box rather than out of an
   * attribute, so the secret stands in the page once. Everything here is optional:
   * without it, and without a clipboard the browser will give us, the value is still
   * selectable text and the button says what to press instead.
   */

  var COPY_RESET_DELAY = 1600;

  function announceCopy(button, text) {
    var original = button.dataset.originalLabel || button.textContent;
    button.dataset.originalLabel = original;
    button.textContent = text;
    button.dataset.copied = "true";
    window.setTimeout(function () {
      button.textContent = button.dataset.originalLabel;
      button.removeAttribute("data-copied");
    }, COPY_RESET_DELAY);
  }

  /** Copy without the Clipboard API, which a plain-HTTP deployment does not get. */
  function copyBySelection(value) {
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

  function onSecretCopy(button) {
    var box = closestElement(button, ".secret-box");
    var code = box ? box.querySelector(".secret-box__value code") : null;
    var value = code ? code.textContent : "";
    if (!value) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(
        function () {
          announceCopy(button, "Copied");
        },
        function () {
          announceCopy(button, copyBySelection(value) ? "Copied" : "Press Ctrl+C");
        }
      );
      return;
    }
    announceCopy(button, copyBySelection(value) ? "Copied" : "Press Ctrl+C");
  }

  function initSecretCopy() {
    document.addEventListener("click", function (event) {
      var button = closestElement(event.target, ".secret-box__copy");
      if (button) onSecretCopy(button);
    });
  }

  /* ----------------------------------------------------- the bookmark store */

  /**
   * dashboard.js (the bookmarks kept in this browser) on the pages that use it.
   *
   * It used to load on every page. It is needed where a page carries one of its
   * controls: an "Add bookmark" button, the list and the buttons of /bookmarks, or the
   * results region of the License Search, whose cards arrive later and are bound by
   * search.js through DALICC.dashboard. The file runs its own set-up whenever it
   * arrives, so loading it after the page is ready is enough.
   */
  var BOOKMARK_HOOKS = [
    "[data-dashboard-toggle]",
    "[data-dashboard-list]",
    "[data-dashboard-count]",
    "[data-dashboard-export]",
    "[data-dashboard-import]",
    "[data-dashboard-clear]",
    "#search-results"
  ].join(",");

  function initBookmarks() {
    var address = document.body && document.body.getAttribute("data-bookmarks-script");
    if (!address || root.dashboard || !document.querySelector(BOOKMARK_HOOKS)) return;
    var script = document.createElement("script");
    script.src = address;
    document.body.appendChild(script);
  }

  /* ------------------------------------------------------ the home scene */

  /**
   * The 2017 infographic of the home page, loaded only where it is shown.
   *
   * The template renders the scene's container empty, with the address of the
   * generated script in data-scene-script. The script, the runtime it loads and the
   * icons come to about 200 KB, so they are asked for only when the window is wider
   * than 768px and the reader has not asked for reduced motion: the CSS shows the
   * still everywhere else, and a phone or a reader who wants a quiet page loads none
   * of it. If the query starts to match later (a window made wider), the scene loads
   * then, once.
   */
  function initHeroScene() {
    var container = document.querySelector("[data-scene-script]");
    if (!container) return;
    var wanted = window.matchMedia(
      "(min-width: 769px) and (prefers-reduced-motion: no-preference)"
    );
    var loaded = false;

    function load() {
      if (loaded || !wanted.matches) return;
      loaded = true;
      var script = document.createElement("script");
      script.src = container.getAttribute("data-scene-script");
      script.charset = "utf-8";
      container.appendChild(script);
    }

    if (wanted.addEventListener) {
      wanted.addEventListener("change", load);
    } else if (wanted.addListener) {
      wanted.addListener(load);
    }
    load();
  }

  /* ------------------------------------------------------------ helpers */

  /** Escape a string for safe insertion as element text. */
  root.text = function (value) {
    return document.createTextNode(value == null ? "" : String(value));
  };

  /** Debounce `fn` by `wait` milliseconds. */
  root.debounce = function (fn, wait) {
    var timer = null;
    return function () {
      var args = arguments;
      var self = this;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        fn.apply(self, args);
      }, wait);
    };
  };

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    initNav();
    initNavDropdowns();
    initBackToTop();
    initSecretCopy();
    initHeroScene();
    initBookmarks();
  });
})();
