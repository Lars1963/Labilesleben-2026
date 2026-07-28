/* Pager an die richtige Stelle verschieben:
   - Gibt es <details class="weiterlesen"> in .prose?
     -> Dann #page-pager in das LETZTE dieser Details verschieben (und damit erst sichtbar, wenn dieses geöffnet ist).
   - Gibt es keine?
     -> #page-pager zurück in den festen Slot (#pager-slot) außerhalb der .prose setzen.
   - Robust gegen bfcache/Restore (pageshow) und unterschiedliche Startpfade.
*/

(function () {
  function $q(sel, root) { return (root || document).querySelector(sel); }
  function $qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function getScope() {
    return $q('.content-inner') || document;
  }
  function getProse(scope) {
    return $q('.prose', scope) || scope;
  }
  function getPager() {
    return document.getElementById('page-pager');
  }
  function getPagerSlot(scope) {
    return $q('#pager-slot', scope) || $q('#pager-slot');
  }
  function getDetailsList(scope) {
    var prose = getProse(scope);
    return $qa('details.weiterlesen', prose);
  }

  function movePagerIntoLastDetails(scope) {
    var pager = getPager();
    if (!pager) return;

    var detailsList = getDetailsList(scope);
    if (detailsList.length === 0) {
      // zurück in den Slot
      var slot = getPagerSlot(scope);
      if (slot && pager.parentNode !== slot) slot.appendChild(pager);
      return;
    }

    var last = detailsList[detailsList.length - 1];

    // Falls der Pager schon im letzten Details ist, nichts tun
    if (pager.parentNode === last) return;

    // Vorher evtl. Pager aus anderem Parent herauslösen und ans Ende vom letzten Details setzen
    try {
      last.appendChild(pager);
    } catch (e) {
      // Fallback: in jedem Fall in den Slot setzen, damit er nicht verschwindet
      var slot = getPagerSlot(scope);
      if (slot) slot.appendChild(pager);
    }
  }

  function apply() {
    var scope = getScope();
    if (!scope) return;

    // Doppelte Pager-Instanzen beseitigen (sicherstellen, dass nur #page-pager existiert)
    var allPagers = $qa('nav.pager');
    allPagers.forEach(function (el) {
      if (el.id !== 'page-pager') {
        // Fremde/doppelte Pager entfernen
        el.parentNode && el.parentNode.removeChild(el);
      }
    });

    movePagerIntoLastDetails(scope);
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  // Initial
  ready(apply);

  // Nach vollständigem Laden / Reflow noch einmal (falls Fonts/Layout etwas verschieben)
  window.addEventListener('load', function () {
    apply();
    setTimeout(apply, 0);
    setTimeout(apply, 200);
  });

  // Bei bfcache-/History-Restore (z.B. Taskleiste in manchen Browsern)
  window.addEventListener('pageshow', function () {
    apply();
  });
})();
