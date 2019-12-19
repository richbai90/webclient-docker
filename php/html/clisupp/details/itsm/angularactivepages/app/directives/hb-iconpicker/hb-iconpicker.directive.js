(function() {
    'use strict';

    angular
        .module('swActivePages')
        .directive('hbIconpicker', hbIconpicker);

    hbIconpicker.$inject = ['$q', '$filter','$document'];
    function hbIconpicker($q, $filter, $document){

        var linker = function(scope, element, attrs, ngModelCtrl){
            var vm = {};
            scope.vm = vm;
            vm.isOpen = false;
            vm.pageString = "Page"; // Translate Later
            vm.prevPageString = "<"; // Translate Later
            vm.nextPageString = ">"; // Translate Later
            vm.filterString = "Search Icon";
            vm.itemsPerPage = 16;
            vm.colSize = 4;
            vm.currentPageNumber = 1;
            vm.fontAwsome = iconset_fontawesome;//-- Update to latest font awesome
            vm.fontHornbill = iconset_hornbill;
            vm.allIcons = [];
            vm.setIcon = function(strIconClass)
            {
                ngModelCtrl.$setViewValue(strIconClass);
                scope.ngModel = strIconClass;
                vm.isOpen = false;
            };
            vm.calcPages = function()
            {
                //-- Calculate Total Number of Pages
                vm.totalPages = Math.floor(vm.totalItems/vm.itemsPerPage);
                if (vm.totalItems > vm.itemsPerPage*vm.totalPages) {
                    vm.totalPages++;
                }
            };
            vm.filterIcons = function()
            {
                vm.currentPageNumber = 1;
                vm.filteredIcons = $filter('filter')(vm.allIcons, {'icon': vm.filter});
                vm.totalItems = vm.filteredIcons.length;
                vm.calcPages();
            };
            vm.init = function()
            {
                if(attrs.colSize)
                {
                    if(attrs.colSize <= 6)
                    {
                        vm.colSize = attrs.colSize;
                    }else {
                        vm.colSize = 4;
                    }

                }

                if(attrs.itemsPerPage)
                {
                    vm.itemsPerPage = attrs.itemsPerPage;
                }
                //-- Just Load Font Awsome
                var allIcons = [];
                if(!attrs.iconSet)
                {
                    angular.forEach(vm.fontAwsome.icons,function(icon){
                        vm.allIcons.push({'icon':icon,'prefix':vm.fontAwsome.iconClassFix});
                    });
                }else
                {
                    var arrIconSet = attrs.iconSet.split(",");
                    if(arrIconSet.indexOf("fa") !== -1)
                    {
                        angular.forEach(vm.fontAwsome.icons,function(icon){
                            vm.allIcons.push({'icon':icon,'prefix':vm.fontAwsome.iconClassFix});
                        });
                    }
                    if(arrIconSet.indexOf("hfa") !== -1)
                    {
                        angular.forEach(vm.fontHornbill.icons,function(icon){
                            vm.allIcons.push({'icon':icon,'prefix':vm.fontHornbill.iconClassFix});
                        });
                    }
                }
                vm.holderWidth = vm.colSize*40;
                vm.filteredIcons = angular.copy(vm.allIcons);
                vm.totalItems = vm.filteredIcons.length;
                vm.calcPages();
            };
            //-- Support for NG Change
            ngModelCtrl.$viewChangeListeners.push(function() {
                scope.$eval(attrs.ngChange);
            });
            vm.init();
        };

        return {
            templateUrl: 'app/directives/hb-iconpicker/hb-iconpicker.html?rel=1',
            require:"^ngModel",
            scope: {
                itemsPerPage:'=',
                colSize: '=',
                appendToBody: '=',
                iconSet: '@', //-- fa,hfa (Defaults to just fa);
                ngModel: '=',
                ngChange: '&'
            },
            link: linker
        };
    }
})();
