(function (){
    'use strict';

    angular
        .module('swActivePages')
        .service('activePageHelpers', activePageHelpers);

    activePageHelpers.$inject = ['$q'];

    function activePageHelpers($q)
    {
      var self = {
      };

      self.getRegexMatches = function(regex, string) {
        //Function to return object containing x amount of regex matches in a string from : http://jsfiddle.net/ravishi/MbwpV/
        if(!(regex instanceof RegExp)) {
          return "ERROR";
        }
        else {
          if (!regex.global) {
            // If global flag not set, create new one.
            var flags = "g";
            if (regex.ignoreCase) flags += "i";
            if (regex.multiline) flags += "m";
            if (regex.sticky) flags += "y";
            regex = new RegExp(regex.source, flags);
          }
        }
        var matches = [];
        var match = regex.exec(string);
        while (match) {
          if (match.length > 2) {
            var group_matches = [];
            for (var i = 1; i < match.length; i++) {
              group_matches.push(match[i]);
            }
            matches.push(group_matches);
          }
          else {
            matches.push(match[1]);
          }
          match = regex.exec(string);
        }
        return matches;
      };

      return self;
    }
})();
