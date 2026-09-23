/* SPDX-License-Identifier: AGPL-3.0-only
 * SPDX-FileCopyrightText: 2021-2026 DALICC - Verein zur Foerderung der Rechtssicherheit in der Datenbewirtschaftung (ZVR 1249185710)
 */
/* DALICC site: the stepped walkthrough on /reasoning.
 *
 * Progressive enhancement, and nothing else. The page is served with all five step
 * texts printed one after the other, the picture in its last state and the stepper
 * hidden; this file hides four of the five texts, unhides the stepper and then only
 * ever writes the data-step attribute of the container. Every state of the picture is
 * a CSS rule in static/site/reasoning.css keyed on that attribute, so the script
 * knows nothing about the drawing and the drawing needs no script to make sense.
 *
 * The markup it binds to (no inline handlers anywhere, the content security policy
 * allows same-origin files only):
 *
 *   [data-reasoning-walkthrough]  the container; carries data-step
 *   [data-step-index="n"]         the text of step n
 *   [data-reasoning-controls]     the stepper, hidden until this runs
 *   [data-reasoning-prev]         one step back, wrapping round at the first
 *   [data-reasoning-next]         one step on, wrapping round at the last
 *   [data-reasoning-go="n"]       jump to step n; carries aria-current when active
 *   [data-reasoning-play]         run through the steps; off until pressed
 *
 * The left and right arrow keys, and Home and End, work while the focus is inside the
 * container. Pressing any control stops a run in progress, and a run stops by itself
 * at the last step rather than starting over.
 */
(function () {
  "use strict";

  var ADVANCE_MS = 6000;

  function setup(root) {
    var steps = Array.prototype.slice.call(
      root.querySelectorAll("[data-step-index]")
    );
    var dots = Array.prototype.slice.call(
      root.querySelectorAll("[data-reasoning-go]")
    );
    var controls = root.querySelector("[data-reasoning-controls]");
    var previous = root.querySelector("[data-reasoning-prev]");
    var next = root.querySelector("[data-reasoning-next]");
    var play = root.querySelector("[data-reasoning-play]");
    var list = steps.length ? steps[0].parentNode : null;
    var total = steps.length;
    if (!total || !controls) {
      return;
    }

    var current = 1;
    var timer = null;

    function stop() {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
      if (play) {
        play.setAttribute("aria-pressed", "false");
        play.textContent = "Play";
      }
    }

    function show(index) {
      current = index;
      root.setAttribute("data-step", String(index));
      steps.forEach(function (step) {
        step.hidden = step.getAttribute("data-step-index") !== String(index);
      });
      dots.forEach(function (dot) {
        if (dot.getAttribute("data-reasoning-go") === String(index)) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }

    function move(delta) {
      // Wrapping keeps both buttons useful at both ends, so neither has to be
      // disabled under the visitor's own focus.
      var index = ((current - 1 + delta) % total + total) % total + 1;
      show(index);
    }

    function start() {
      stop();
      if (current === total) {
        show(1);
      }
      timer = window.setInterval(function () {
        if (current >= total) {
          stop();
          return;
        }
        show(current + 1);
      }, ADVANCE_MS);
      if (play) {
        play.setAttribute("aria-pressed", "true");
        play.textContent = "Pause";
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        stop();
        move(-1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        stop();
        move(1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        stop();
        var index = parseInt(dot.getAttribute("data-reasoning-go"), 10);
        if (index >= 1 && index <= total) {
          show(index);
        }
      });
    });
    if (play) {
      play.addEventListener("click", function () {
        if (timer === null) {
          start();
        } else {
          stop();
        }
      });
    }

    root.addEventListener("keydown", function (event) {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      var key = event.key;
      if (key === "ArrowRight" || key === "ArrowLeft") {
        stop();
        move(key === "ArrowRight" ? 1 : -1);
      } else if (key === "Home") {
        stop();
        show(1);
      } else if (key === "End") {
        stop();
        show(total);
      } else {
        return;
      }
      event.preventDefault();
    });

    // A step at a time is only readable once the stepper is there to move it.
    if (list) {
      list.setAttribute("aria-live", "polite");
    }
    controls.hidden = false;
    show(1);
  }

  function init() {
    var roots = document.querySelectorAll("[data-reasoning-walkthrough]");
    Array.prototype.forEach.call(roots, setup);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
