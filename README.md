# searchbar.js
<!DOCTYPE html>
<!--
To change this license header, choose License Headers in Project Properties.
To change this template file, choose Tools | Templates
and open the template in the editor.
-->
<html>
    <head>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.12.3/jquery.min.js" type="text/javascript" charset="utf-8"></script>
        <script src="js/searchbar.js" type="text/javascript"></script>
        <link href="css/css.css" type="text/css" rel="stylesheet">
    </head>
    <body>
        <form>
            <input type="text" class="myTaggableInput" name="lel" placeholder="Write here">
        </form>

        <script>
            function tagMyInput(JSON) {
                $(".myTaggableInput").searchbar({
                    maxAutocompleteShow: 0, //max pocet zobrazenych napoved
                    minInputWidth: 100,
                    showCategories: true,
                    caseSensitive: true,
                    allowDuplicity: false, //duplicita tagu
                    tagLength: 5, //max delka stringu v tagu
                    tagLengthMessage: "Too long", //zprava pri presahnuti delky
                    noTagsMessage: "no Tags",
                    tagCount: 6, //max pocet tagu
                    tagCountMessage: "Too man(l)y", //zprava pri presahnuti poctu
                    autocompleteTags: {
                        "First name": [
                            "Delaney",
                            "Rosa",
                            "Leola",
                            "Laura"
                        ],
                        "Last name": [
                            "Kelly",
                            "Mcmillan",
                            "Hoffman",
                            "Head",
                            "Yang",
                            "Mcfarland"
                        ],
                        "Lorem ipsum": [
                            "duis",
                            "sint",
                            "pariatur",
                            "mollit",
                            "nisi",
                            "minim",
                            "ut",
                            "consectetur",
                            "tempor",
                            "tempor",
                            "voluptate",
                            "qui",
                            "duis",
                            "sit",
                            "cillum",
                            "excepteur",
                            "labore"
                        ]
                    }//autocomplete
                });
            }

        </script>


    </body>
</html>
