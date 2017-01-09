(function (root) {
  try {
    // Implement API for timings collection

    var vars = {};
    var stamps = {};

    var now = (function () {
      if (Date.now) {
        return Date.now;
      }

      return function () {
        return new Date().getTime();
      };
    }());

    function addVar(name, value) {
      if (typeof name === 'string') {
        vars[name] = value;
      } else {
        for (var key in name) {
          if (name.hasOwnProperty(key)) {
            vars[key] = name[key];
          }
        }
      }
    }

    function addTimestamp(name, time) {
      stamps[name] = time;
    }

    // Collect base timings

    var loadTimes = root.chrome && root.chrome.loadTimes();
    var performance = root.performance || root.msPerformance || root.webkitPerformance || root.mozPerformance || null;
    var timing = performance.timing;
    var csi;

    // Older versions of chrome also have a timing API that's sort of documented here:
    // http://ecmanaut.blogspot.com/2010/06/google-bom-feature-ms-since-pageload.html
    // source here:
    // http://src.chromium.org/viewvc/chrome/trunk/src/chrome/renderer/loadtimes_extension_bindings.cc?view=markup
    if (root.chrome && root.chrome.csi) {
      csi = root.chrome.csi();
    }

    // The Google Toolbar exposes navigation start time similar to old versions of chrome
    // This would work for any browser that has the google toolbar installed
    if (root.gtbExternal) {
      csi = root.gtbExternal;
    }

    if (timing) {
      // Always use navigationStart since it falls back to fetchStart (not with redirects)
      // Never use requestStart since if the first request fails and the browser retries,
      // it will contain the value for the new request.
      var navigationStart = timing.navigationStart || timing.fetchStart;

      // bug in Firefox 7 & 8 https://bugzilla.mozilla.org/show_bug.cgi?id=691547
      if (root.navigator.userAgent.match(/Firefox\/[78]\./)) {
        navigationStart = timing.unloadEventStart || timing.fetchStart;
      }

      addTimestamp('navigationStart', navigationStart);
    } else {
      var navigationStart = (csi && csi.startE) ||
        (loadTimes && loadTimes.startLoadTime && Math.round(loadTimes.startLoadTime * 1000)) ||
        now();
      var domLoading = (loadTimes && loadTimes.commitLoadTime && Math.round(loadTimes.commitLoadTime * 1000)) ||
        now();

      addTimestamp('navigationStart', navigationStart);
      addTimestamp('domLoading', domLoading);
    }

    if (performance) {
      addVar({
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        ttfb: timing.responseStart - timing.connectEnd,
        request: timing.responseStart - timing.requestStart,
        response: timing.responseEnd - timing.responseStart
      });
    }

    document.addEventListener('DOMContentLoaded', function () {
      var domInteractive = timing.domInteractive || now();
      var domLoading = timing.domLoading || stamps.domLoading;

      addTimestamp('domInteractive', domInteractive);
      addVar('domProcessing', domInteractive - domLoading);
    });

    root.addEventListener('load', function () {
      var domComplete = timing.domComplete || now();

      addTimestamp('domComplete', domComplete);
      addVar('domComplete', domComplete - stamps.domInteractive);
    });

    root.vodPerformance = {
      performance: performance,

      now: now,

      addVar: addVar,
      addTimestamp: addTimestamp,

      stamps: stamps,
      vars: vars
    };
  } catch (err) {}
}(window));
