/* SPDX-License-Identifier: AGPL-3.0-only
 * SPDX-FileCopyrightText: 2021-2026 DALICC - Verein zur Foerderung der Rechtssicherheit in der Datenbewirtschaftung (ZVR 1249185710)
 */
/* DALICC site: the dependency-graph visualisation.
 *
 * Draws the deontic axioms of one graph as an SVG with no external library: the
 * nodes sit on a circle (a layout that is stable, deterministic and readable for
 * ~30 nodes, unlike a random force simulation), edges are quadratic curves
 * coloured per relation, and hovering or focusing a node dims everything it is
 * not connected to.
 *
 * Node labels are CURIEs (cc:Attribution, odrl:includedIn), the same names the
 * vocabulary, the tables and the editor use; the human label stays in the
 * accessible name of the node so a screen reader hears both.
 *
 * The data comes from the JSON in #dependency-graph-data, written by the server.
 * The complete list of statements is in the tables below the figure, so the page
 * is fully usable when this script does not run.
 */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var WIDTH = 900;
  var HEIGHT = 660;

  function readData() {
    var node = document.getElementById("dependency-graph-data");
    if (!node) return null;
    try {
      return JSON.parse(node.textContent);
    } catch (err) {
      return null;
    }
  }

  function element(name, attributes) {
    var node = document.createElementNS(SVG_NS, name);
    Object.keys(attributes || {}).forEach(function (key) {
      node.setAttribute(key, attributes[key]);
    });
    return node;
  }

  /** Positions on a circle, with a little breathing room for the labels. */
  function layout(count) {
    var cx = WIDTH / 2;
    var cy = HEIGHT / 2;
    var radius = Math.min(WIDTH, HEIGHT) / 2 - 104;
    var points = [];
    for (var i = 0; i < count; i += 1) {
      var angle = (2 * Math.PI * i) / count - Math.PI / 2;
      points.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        angle: angle
      });
    }
    return { points: points, cx: cx, cy: cy };
  }

  function draw(container, data) {
    var nodes = data.nodes || [];
    var edges = data.edges || [];
    if (!nodes.length) return;

    var place = layout(nodes.length);
    var svg = element("svg", {
      viewBox: "0 0 " + WIDTH + " " + HEIGHT,
      role: "presentation",
      focusable: "false"
    });

    var edgeLayer = element("g", { "stroke-linecap": "round", fill: "none" });
    var nodeLayer = element("g", {});
    svg.appendChild(edgeLayer);
    svg.appendChild(nodeLayer);

    var byNode = {};
    edges.forEach(function (edge, index) {
      var from = place.points[edge.source];
      var to = place.points[edge.target];
      if (!from || !to) return;
      // Bend every edge towards the centre so parallel relations stay apart.
      var mx = (from.x + to.x) / 2;
      var my = (from.y + to.y) / 2;
      var bend = 0.45 + (index % 3) * 0.08;
      var qx = place.cx + (mx - place.cx) * bend;
      var qy = place.cy + (my - place.cy) * bend;
      var path = element("path", {
        d: "M" + from.x + "," + from.y + " Q" + qx + "," + qy + " " + to.x + "," + to.y,
        stroke: edge.colour || "#505d66",
        "stroke-width": "1.6",
        opacity: "0.72"
      });
      path.dataset.source = String(edge.source);
      path.dataset.target = String(edge.target);
      edgeLayer.appendChild(path);
      (byNode[edge.source] = byNode[edge.source] || []).push(path);
      (byNode[edge.target] = byNode[edge.target] || []).push(path);
    });

    nodes.forEach(function (item, index) {
      var point = place.points[index];
      var group = element("g", { tabindex: "0", class: "dg-node-group" });
      group.setAttribute("aria-label", item.label + " (" + item.curie + ")");
      var circle = element("circle", { cx: point.x, cy: point.y, r: 7, class: "dg-node" });
      // Near the top and the bottom of the circle, neighbouring nodes share almost
      // the same y, so a label pushed sideways collides with its neighbour's.
      // Those get a centred label above or below the node instead.
      var cos = Math.cos(point.angle);
      var sin = Math.sin(point.angle);
      var vertical = Math.abs(cos) < 0.34;
      var anchor = vertical ? "middle" : cos < 0 ? "end" : "start";
      // Alternate rows so two centred labels side by side cannot collide either.
      var stagger = index % 2 ? 14 : 0;
      var lift = (sin < 0 ? -15 - stagger : 22 + stagger);
      var label = element("text", {
        x: vertical ? point.x : point.x + (cos < 0 ? -13 : 13),
        y: vertical ? point.y + lift : point.y + 4,
        class: "dg-node-label",
        "text-anchor": anchor
      });
      // The CURIE is the name every other surface uses, so it is what is drawn.
      label.textContent = item.curie || item.label;
      group.appendChild(circle);
      group.appendChild(label);

      function focus(on) {
        svg.classList.toggle("dg-focused", on);
        var mine = byNode[index] || [];
        edgeLayer.querySelectorAll("path").forEach(function (path) {
          path.setAttribute("opacity", !on || mine.indexOf(path) !== -1 ? "0.85" : "0.12");
        });
        nodeLayer.querySelectorAll(".dg-node-group").forEach(function (other) {
          other.style.opacity = !on || other === group ? "1" : "0.35";
        });
        if (on) {
          mine.forEach(function (path) {
            path.setAttribute("stroke-width", "2.6");
          });
        } else {
          edgeLayer.querySelectorAll("path").forEach(function (path) {
            path.setAttribute("stroke-width", "1.6");
            path.setAttribute("opacity", "0.72");
          });
        }
      }

      group.addEventListener("mouseenter", function () {
        focus(true);
      });
      group.addEventListener("mouseleave", function () {
        focus(false);
      });
      group.addEventListener("focus", function () {
        focus(true);
      });
      group.addEventListener("blur", function () {
        focus(false);
      });
      nodeLayer.appendChild(group);
    });

    container.textContent = "";
    container.appendChild(svg);
  }

  function start() {
    var container = document.getElementById("dependency-graph-canvas");
    if (!container) return;
    var data = readData();
    if (!data) return;
    try {
      draw(container, data);
    } catch (err) {
      /* the tables below are the real content; leave the figure empty */
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
