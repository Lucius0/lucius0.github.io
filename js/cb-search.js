 $(document).ready(function() {
     var names = new Array(); //文章名字等
     var urls = new Array(); //文章地址


     $(".search_nav").focus(function() {
         
     });

     $(".search_nav").blur(function() {
     	
     });

     $.getJSON("/cb-search.json").done(function(data) {
         if (data.code == 0) {
             for (var index in data.data) {
                 var item = data.data[index];
                 names.push(item.title);
                 urls.push(item.url);
             }

             $(".search_nav").typeahead({
                 source: names,

                 afterSelect: function(item) {
                     window.location.href = (urls[names.indexOf(item)]);
                     return item;
                 }
             });
         }
     });
 });
