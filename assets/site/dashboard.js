/* SPDX-License-Identifier: AGPL-3.0-only
 * SPDX-FileCopyrightText: 2021-2026 DALICC - Verein zur Foerderung der Rechtssicherheit in der Datenbewirtschaftung (ZVR 1249185710)
 */
/* DALICC site: bookmarks.
 *
 * Bookmarks live in the visitor's own browser (localStorage); nothing is sent to
 * the server and nothing is shared between devices. The page at /bookmarks renders
 * itself from this store; every other page can add to it.
 *
 * The module is still called DALICC.dashboard and the store is still keyed
 * dalicc.dashboard.v1: those names are what existing bookmarks are saved under, so
 * renaming them would throw the bookmarks people already have away.
 *
 * Public API (window.DALICC.dashboard):
 *
 *   add(id, title)   remember a license; returns the stored entry
 *   has(id)          -> boolean
 *   remove(id)       -> boolean (true when something was removed)
 *   all()            -> [{id, title, url, added}], newest first
 *   clear()          empty the store
 *   count()          -> how many licenses are bookmarked
 *   toJSON()         -> pretty-printed JSON string (for export)
 *   importJSON(text) merge an exported file; returns the number of new entries
 *   subscribe(fn)    call fn(all()) on every change; returns an unsubscribe fn
 *   bind(el)         wire one "Add bookmark" button (see data attributes below)
 *
 * A button wired by `bind` (or carrying [data-dashboard-toggle]) uses:
 *   data-license-id="MIT"          required
 *   data-license-title="The MIT License"
 *   data-added-label / data-add-label   optional button captions
 * and gets aria-pressed kept in sync.
 */
(function () {
  "use strict";

  var root = (window.DALICC = window.DALICC || {});
  var KEY = "dalicc.dashboard.v1";
  var listeners = [];

  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
    } catch (err) {
      return [];
    }
  }

  function write(entries) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(entries));
    } catch (err) {
      /* storage blocked: the bookmarks are simply not persisted */
    }
    for (var i = 0; i < listeners.length; i += 1) {
      try {
        listeners[i](entries.slice());
      } catch (err) {
        /* a broken listener must not break the store */
      }
    }
  }

  function isEntry(value) {
    return value && typeof value === "object" && typeof value.id === "string" && value.id;
  }

  function normalise(id, title) {
    var clean = String(id).trim();
    return {
      id: clean,
      title: String(title || clean).trim() || clean,
      url: "/license-library/" + encodeURIComponent(clean),
      added: new Date().toISOString()
    };
  }

  var dashboard = {
    all: function () {
      return read().slice().sort(function (a, b) {
        return String(b.added || "").localeCompare(String(a.added || ""));
      });
    },
    count: function () {
      return read().length;
    },
    has: function (id) {
      var wanted = String(id).trim();
      return read().some(function (entry) {
        return entry.id === wanted;
      });
    },
    add: function (id, title) {
      var entry = normalise(id, title);
      if (!entry.id) return null;
      var entries = read();
      var index = entries.findIndex(function (item) {
        return item.id === entry.id;
      });
      if (index >= 0) {
        entries[index] = { id: entry.id, title: entry.title, url: entry.url, added: entries[index].added };
      } else {
        entries.push(entry);
      }
      write(entries);
      return entry;
    },
    remove: function (id) {
      var wanted = String(id).trim();
      var entries = read();
      var kept = entries.filter(function (entry) {
        return entry.id !== wanted;
      });
      if (kept.length === entries.length) return false;
      write(kept);
      return true;
    },
    toggle: function (id, title) {
      if (dashboard.has(id)) {
        dashboard.remove(id);
        return false;
      }
      dashboard.add(id, title);
      return true;
    },
    clear: function () {
      write([]);
    },
    toJSON: function () {
      return JSON.stringify(
        { format: "dalicc-dashboard", version: 1, licenses: dashboard.all() },
        null,
        2
      );
    },
    importJSON: function (text) {
      var parsed = JSON.parse(text);
      var incoming = Array.isArray(parsed) ? parsed : parsed && parsed.licenses;
      if (!Array.isArray(incoming)) throw new Error("Unrecognised bookmark file.");
      var before = dashboard.count();
      var entries = read();
      incoming.filter(isEntry).forEach(function (item) {
        var exists = entries.some(function (entry) {
          return entry.id === item.id;
        });
        if (!exists) entries.push(normalise(item.id, item.title));
      });
      write(entries);
      return dashboard.count() - before;
    },
    subscribe: function (fn) {
      listeners.push(fn);
      return function () {
        listeners = listeners.filter(function (item) {
          return item !== fn;
        });
      };
    },
    bind: function (element) {
      if (!element || element.dataset.dashboardBound === "true") return;
      var id = element.dataset.licenseId;
      if (!id) return;
      element.dataset.dashboardBound = "true";

      function paint() {
        var on = dashboard.has(id);
        element.setAttribute("aria-pressed", on ? "true" : "false");
        var caption = on
          ? element.dataset.addedLabel || "Remove bookmark"
          : element.dataset.addLabel || "Add bookmark";
        element.textContent = caption;
      }

      element.addEventListener("click", function (event) {
        event.preventDefault();
        dashboard.toggle(id, element.dataset.licenseTitle || id);
        paint();
      });
      dashboard.subscribe(paint);
      paint();
    }
  };

  root.dashboard = dashboard;

  /* ------------------------------------------------ the /bookmarks page */

  function renderList(container, entries) {
    container.textContent = "";
    if (!entries.length) {
      var empty = document.createElement("div");
      empty.className = "dashboard-empty";
      var line = document.createElement("p");
      line.appendChild(
        document.createTextNode("You have not bookmarked any licenses yet. Open a license in the ")
      );
      var link = document.createElement("a");
      link.href = "/license-library";
      link.appendChild(document.createTextNode("License Library"));
      line.appendChild(link);
      line.appendChild(document.createTextNode(' and use "Add bookmark".'));
      empty.appendChild(line);
      container.appendChild(empty);
      return;
    }

    var list = document.createElement("ul");
    list.className = "license-list";
    entries.forEach(function (entry) {
      var item = document.createElement("li");
      var card = document.createElement("div");
      card.className = "dashboard-row";

      var heading = document.createElement("p");
      heading.className = "license-card__title";
      var anchor = document.createElement("a");
      anchor.href = entry.url || "/license-library/" + encodeURIComponent(entry.id);
      anchor.appendChild(document.createTextNode(entry.title || entry.id));
      heading.appendChild(anchor);

      var meta = document.createElement("span");
      meta.className = "license-card__id";
      meta.appendChild(document.createTextNode(entry.id));

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn btn--small btn--slate";
      remove.appendChild(document.createTextNode("Remove bookmark"));
      remove.addEventListener("click", function () {
        dashboard.remove(entry.id);
      });

      card.appendChild(heading);
      card.appendChild(meta);
      card.appendChild(remove);
      item.appendChild(card);
      list.appendChild(item);
    });
    container.appendChild(list);
  }

  function initPage() {
    var container = document.querySelector("[data-dashboard-list]");
    if (container) {
      dashboard.subscribe(function (entries) {
        renderList(container, dashboard.all());
      });
      renderList(container, dashboard.all());
    }

    var counter = document.querySelector("[data-dashboard-count]");
    if (counter) {
      var paintCount = function () {
        counter.textContent = String(dashboard.count());
      };
      dashboard.subscribe(paintCount);
      paintCount();
    }

    var exportButton = document.querySelector("[data-dashboard-export]");
    if (exportButton) {
      exportButton.addEventListener("click", function () {
        var blob = new Blob([dashboard.toJSON()], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "dalicc-bookmarks.json";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      });
    }

    var importInput = document.querySelector("[data-dashboard-import]");
    if (importInput) {
      importInput.addEventListener("change", function () {
        var file = importInput.files && importInput.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var added = dashboard.importJSON(String(reader.result));
            if (root.flash) root.flash("Imported " + added + " new bookmark(s).", "success");
          } catch (err) {
            if (root.flash) root.flash("That file is not a DALICC bookmark export.", "error");
          }
          importInput.value = "";
        };
        reader.readAsText(file);
      });
    }

    var clearButton = document.querySelector("[data-dashboard-clear]");
    if (clearButton) {
      clearButton.addEventListener("click", function () {
        if (window.confirm("Remove every bookmark from this browser?")) {
          dashboard.clear();
        }
      });
    }

    var toggles = document.querySelectorAll("[data-dashboard-toggle]");
    for (var i = 0; i < toggles.length; i += 1) {
      dashboard.bind(toggles[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
})();
