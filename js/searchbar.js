/**
 * jQuery Searchbar.js
 *
 * @version v1.0 (05/2016)
 *
 * Copyright 2016, Erik Ibolya
 * Released under the MIT license.
 * https://github.com/erikibolya/searchbar.js/blob/master/LICENSE
 *
 * Homepage:
 * https://github.com/erikibolya/searchbar.js
 *
 * Author: Erik Ibolya
 *
 * Dependencies:
 *   jQuery v1.12.3+
 */
(function ($) {
    $.fn.searchbar = function (parameters) {
        if (this.length > 1) {
            for (var jjj = 0; jjj < this.length; jjj++) {
                $(this[jjj]).searchbar(parameters);
            }
            return true;
        } else if (this.length === 0) {
            return false;
        }
        //mapping
        var inputCSS = {
            "text-rendering": "auto",
            "color": "inherit",
            "letter-spacing": "inherit",
            "word-spacing": "inherit",
            "text-transform": "inherit",
            "text-indent": "inherit",
            "text-shadow": "inherit",
            "text-align": "inherit",
            "font": "inherit",
            "margin": "0",
            "padding": "0",
            "box-sizing": "border-box",
            "border": "none",
            "outline": "none",
            "float": "right"
        };
        //parameters            
        var allowDuplicity;
        var showCategories;
        var caseSensitive;

        var minInputWidth;
        var tagLength;
        var tagCount;
        var maxAutocompleteShow;

        var tagLengthMessage;
        var tagCountMessage;
        var noTagsMessage;

        var autocompleteTags;

        //attributes
        var name;
        var identificator;
        var placeholder;
        //elements reference
        var input = this;
        var thead;
        var tbody;
        var myTags;
        var myTagsTexts;
        var parend;
        var help;
        //help variables
        var hover = null;
        var currentAutocompleteTags = [];
        var selectX = 0;
        var selectY = -1;
        //init methods
        initVariables();
        createStructure();
        eventsListening();

        function initVariables() {
            allowDuplicity = (parameters["allowDuplicity"] !== 'undefined' && typeof parameters["allowDuplicity"] === 'boolean') ? parameters["allowDuplicity"] : true;
            showCategories = (parameters["showCategories"] !== 'undefined' && typeof parameters["showCategories"] === 'boolean') ? parameters["showCategories"] : true;
            caseSensitive = (parameters["caseSensitive"] !== 'undefined' && typeof parameters["caseSensitive"] === 'boolean') ? parameters["caseSensitive"] : true;

            tagCount = (parameters["tagCount"] !== 'undefined' && $.isNumeric(parameters["tagCount"]) && parameters["tagCount"] > 0) ? parameters["tagCount"] : 0;
            tagLength = (parameters["tagLength"] !== 'undefined' && $.isNumeric(parameters["tagLength"]) && parameters["tagLength"] > 0) ? new RegExp("^.{0," + parameters["tagLength"] + "}$") : 0;
            maxAutocompleteShow = (parameters["maxAutocompleteShow"] !== 'undefined' && $.isNumeric(parameters["maxAutocompleteShow"]) && parameters["maxAutocompleteShow"] > 0) ? parameters["maxAutocompleteShow"] : 0;
            tagLengthMessage = (parameters["tagLengthMessage"] !== 'undefined' && typeof parameters["tagLengthMessage"] === 'string') ? parameters["tagLengthMessage"] : '';
            tagCountMessage = (parameters["tagCountMessage"] !== 'undefined' && typeof parameters["tagCountMessage"] === 'string') ? parameters["tagCountMessage"] : '';
            noTagsMessage = (parameters["noTagsMessage"] !== 'undefined' && typeof parameters["noTagsMessage"] === 'string') ? parameters[" noTagsMessage"] : '';

            autocompleteTags = ((parameters["autocompleteTags"] !== 'undefined') ?
                    ((typeof parameters["autocompleteTags"] === 'function' && typeof parameters["autocompleteTags"]() === 'object') ?
                            parameters["autocompleteTags"]() : ((typeof parameters["autocompleteTags"] === 'object') ?
                            parameters["autocompleteTags"] : [])) : []);

            placeholder = input.attr("placeholder") === "undefined" ? '' : input.attr("placeholder");
            minInputWidth = (parameters["minInputWidth"] !== 'undefined' && $.isNumeric(parameters["minInputWidth"])) ? parameters["minInputWidth"] : 100;

            name = input.attr("name");
            identificator = (input[0].hasAttribute("id")) ? {'id': input.attr("id")} : (input[0].hasAttribute("class")) ? {'class': input.attr("class")} : "";
            myTags = [];
            myTagsTexts = [];
        }

        function createStructure() {
            var wrapper = $("<div></div>");
            if (identificator !== '') {
                for (var iden in identificator) {
                    wrapper.attr(iden, identificator[iden]);
                }
            }
            input.after(wrapper);
            input.removeAttr("name");
            input.removeClass();
            input.detach();
            input = $("<input type='text'>");
            wrapper.append(input);
            parend = input.parent();
            input.after($("<table class='help'></table>"));
            help = input.next();
            thead = $("<thead></thead>");
            tbody = $("<tbody></tbody>");
            help.append(thead);
            help.append(tbody);
            input.css(inputCSS);
            input.attr("placeholder", placeholder);
            input.attr("autocomplete", "off");
            parend.css("min-height", parend.css("height"));
            parend.css("height", "initial");
            input.outerHeight(parend.height());
            resize();
        }


        //-------------------------------

        function resize() {
            var occupiedWidth = 0;
            var limit = myTags.length;
            for (var i = 0; i < limit - 1; i++) {
                occupiedWidth += myTags[i].outerWidth(true);
                if (occupiedWidth + myTags[i + 1].outerWidth(true) > parend.width()) {
                    occupiedWidth = 1;
                }
            }
            if (myTags.length !== 0) {
                occupiedWidth++;
                if (occupiedWidth + myTags[i].outerWidth(true) > parend.width()) {
                    occupiedWidth = 1;
                } else {
                    occupiedWidth += myTags[i].outerWidth(true);
                }
            }
            input.width((occupiedWidth + minInputWidth > parend.width()) ? parend.width() : parend.width() - occupiedWidth);
            var x = parend.offset().left;
            var y = parend.offset().top;
            help.outerWidth(parend.outerWidth());
            help.css("position", "absolute");
            help.css("left", x + "px");
            help.css("top", y + parend.outerHeight() - parseInt(parend.css("border-bottom-width")) + "px");
        }

        function addTag(value, classname) {
            if (tagCount !== 0 && tagCount < count(myTags) + 1) {
                if (isAutocompleteExpanded()) {
                    collapseAutocomplete();
                }
                input[0].setCustomValidity(tagCountMessage);
                return;
            }
            if (!allowDuplicity) {
                if ($.inArray(input.val().trim(), myTagsTexts) >= 0) {
                    if (isAutocompleteExpanded()) {
                        collapseAutocomplete();
                    }
                    input.val("");
                    return;
                }
            }
            var node = $("<span></span>");
            node.addClass("tag " + classname);
            node.text(value);
            node.append("<span class='delete'></span>");
            node.append("<input type='hidden' value='" + value + "' name='" + name + "[]'>");
            input.before(node);
            input.val("");
            input.attr("placeholder", "");
            myTags.push(node);
            if (!allowDuplicity) {
                myTagsTexts.push(node[0].innerText);
            }
            resize();
            if (isAutocompleteExpanded()) {
                collapseAutocomplete();
            }
        }

        function removeTag(tag) {
            if (!allowDuplicity) {
                myTagsTexts.splice($.inArray(tag[0].innerText, myTagsTexts), 1);
            }
            tag.remove();
            myTags.splice($.inArray(tag, myTags), 1);
            if (myTags.length === 0) {
                input.attr("placeholder", placeholder);
            }
            resize();
            if (help.hasClass('active')) {
                collapseAutocomplete();
            }
        }

        function isAutocompleteExpanded() {
            return help.hasClass("active");
        }

        function collapseAutocomplete() {
            selectX = 0;
            selectY = -1;
            hover = null;
            help.removeClass("active");
            thead.html("");
            tbody.html("");
        }

        function expandAutocomplete() {
            help.addClass("active");
            thead.html("");
            tbody.html("");
            var rows = [];
            var width = help.width() / count(currentAutocompleteTags);
            var rowsnum = 0;
            var alreadyInserted = 0;
            //prepare all rows for later insertion
            for (var category in currentAutocompleteTags) {
                if (currentAutocompleteTags[category].length > rowsnum) {
                    rowsnum = currentAutocompleteTags[category].length;
                    for (var i = alreadyInserted; i < rowsnum; i++) {
                        rows[i] = $("<tr></tr>");
                        alreadyInserted++;
                    }
                }
            }
            var gi = 1;
            for (var category in currentAutocompleteTags) {
                var limit = currentAutocompleteTags[category].length;
                if (limit > 0) {
                    if (showCategories) {
                        var th = $("<th></th>");
                        th.width(width);
                        th.html(category);
                        th.addClass("col-" + gi);
                        thead.append(th);
                    }
                    for (var i = 0; i < limit; i++) {
                        var cell = $("<td class='filled col-" + gi + "'></td>");
                        cell.width(width);
                        cell.html(currentAutocompleteTags[category][i]);
                        rows[i].append(cell);
                    }
                    for (var j = limit; j < rowsnum; j++) {
                        rows[j].append("<td class='col-" + gi + "'></td>");
                    }
                }
                gi++;
            }
            for (i = 0, limit = rows.length; i < limit; i++) {
                tbody.append(rows[i]);
            }
        }

        function recalculateTags(value) {
            currentAutocompleteTags = {};
            if (value.trim()) {
                value = value.trim();
                var tags = 0;
                for (var category in autocompleteTags) {
                    var limit = autocompleteTags[category].length;
                    currentAutocompleteTags[category] = [];
                    for (var i = limit - 1; i >= 0; i--) {
                        if (!allowDuplicity) {
                            if ($.inArray(autocompleteTags[category][i], myTagsTexts) >= 0) {
                                continue;
                            }
                        }
                        var posbold = autocompleteTags[category][i].substring(0, value.length);
                        var ddd = caseSensitive ? posbold === value : value.toLowerCase() === posbold.toLowerCase();
                        if (ddd) {
                            if (maxAutocompleteShow !== 0) {
                                if (tags < maxAutocompleteShow) {
                                    tags++;
                                    currentAutocompleteTags[category].push("<b>" + posbold + "</b>" + autocompleteTags[category][i].substring(value.length));
                                } else {
                                    return;
                                }
                            } else {
                                currentAutocompleteTags[category].push("<b>" + posbold + "</b>" + autocompleteTags[category][i].substring(value.length));
                            }
                        }
                    }
                }
            }
        }

        function moveSelection(int) {
            var rows = help.find("tbody")[0].childElementCount;
            var columns = help.find("tr")[0].childElementCount;
            if (rows !== 0) {
                if (selectY === -1) {
                    if (int === 2) {
                        selectY++;
                        selectTag(selectX, selectY);
                    } else if (int === 1 && columns > 1) {
                        selectY++;
                        selectX++;
                        selectTag(selectX, selectY);
                    }
                } else {
                    switch (int) {
                        case 0:
                            if (selectY > 0) {
                                selectY--;
                                selectTag(selectX, selectY);
                            }
                            break;
                        case 1:
                            if (selectX < columns - 1) {
                                var row = help.find("tr");
                                if ($(row[selectY].childNodes[selectX + 1]).hasClass("filled")) {
                                    selectX++;
                                    selectTag(selectX, selectY);
                                } else {
                                    for (var a = rows - 1; a >= 0; a--) {
                                        if ($(row[a].childNodes[selectX + 1]).hasClass("filled")) {
                                            selectX++;
                                            selectY = a;
                                            selectTag(selectX, selectY);
                                            break;
                                        }
                                    }
                                }
                            }
                            break;
                        case 2:
                            if (selectY < rows - 1) {
                                var row = help.find("tr")[selectY + 1];
                                if ($(row.childNodes[selectX]).hasClass("filled")) {
                                    selectY++;
                                    selectTag(selectX, selectY);
                                }
                            }
                            break;
                        case 3:
                            if (selectX > 0) {
                                var row = help.find("tr");
                                if ($(row[selectY].childNodes[selectX - 1]).hasClass("filled")) {
                                    selectX--;
                                    selectTag(selectX, selectY);
                                } else {
                                    for (var a = rows - 2; a >= 0; a--) {
                                        if ($(row[a].childNodes[selectX + 1]).hasClass("filled")) {
                                            selectX--;
                                            selectY = a;
                                            selectTag(selectX, selectY);
                                            break;
                                        }
                                    }
                                }
                            }
                            break;
                    }
                }
            }
        }

        function selectTag(xx, yy) {
            if (hover !== null) {
                $(hover).removeClass("hover");
                hover = null;
            }
            selectX = xx;
            selectY = yy;
            hover = $($(help.find("tr")[yy]).find("td")[xx]);
            hover.addClass("hover");
        }

        function eventsListening() {
            input.keydown(function (e) {
                if (e.which === 8 || e.keyCode === 8) {
                    if (input.val() === "" && myTags.length > 0) {
                        removeTag(myTags[myTags.length - 1]);
                    }
                } else if (e.which === 37) {
                    if (isAutocompleteExpanded()) {
                        moveSelection(3);
                        e.preventDefault();
                    }
                } else if (e.which === 38) {
                    if (isAutocompleteExpanded()) {
                        moveSelection(0);
                        e.preventDefault();
                    }
                } else if (e.which === 39) {
                    if (isAutocompleteExpanded()) {
                        moveSelection(1);
                        e.preventDefault();
                    }
                } else if (e.which === 40)
                    if (isAutocompleteExpanded()) {
                        moveSelection(2);
                        e.preventDefault();
                    }
            });

            input.closest("form").on('submit', function (e) {
                if (input.val().trim() === '' && count(myTags) === 0) {
                    e.preventDefault();
                    input[0].setCustomValidity(noTagsMessage);
                    return false;
                } else if (tagLength !== 0 && !tagLength.test(input.val().trim())) {
                    e.preventDefault();
                    input[0].setCustomValidity(tagLengthMessage);
                    return false;
                } else if (hover !== null) {
                    var c = hover.attr("class").slice(7);
                    addTag(hover.text(), c.slice(0, c.length - 6));
                    return false;
                } else {
                    var val = input.val().trim();
                    var posstds = help.find("td:contains(" + val + ")");
                    for (var i = 0; i < posstds.length; i++) {
                        if (posstds[i].innerText === val) {
                            addTag(val, posstds[i].className.slice(7));
                            return false;
                        }
                    }
                    if (val !== '') {
                        addTag(val, "");
                        return false;
                    }
                }
            });

            input.on("input paste", function (e) {
                recalculateTags($(this).val());
                if (count(currentAutocompleteTags) > 0) {
                    expandAutocomplete();
                } else {
                    collapseAutocomplete();
                }
                input[0].setCustomValidity('');
            });

            parend.on("click", ".tag .delete", function () {
                var checkpoint = $(this).parent().index();
                removeTag(myTags[checkpoint]);
                collapseAutocomplete();
            });

            help.on("click", "td.filled", function () {
                var c = $(this).attr("class").slice(7);
                addTag($(this).text(), c.slice(0, c.length - 6));
                collapseAutocomplete();
            });

            help.on("mouseenter", "td.filled", function () {
                r = $(this).parent().index();
                c = $(this).index();
                selectTag(c, r);
            });

            $(window).resize(function () {
                resize();
            });
        }

        function count(obj) {
            var count = 0;
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop))
                    ++count;
            }

            return count;
        }



    }
    ;
})(jQuery);
