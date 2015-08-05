marker = new google.maps.Marker({
	map:map,
	draggable:true,
	animation: google.maps.Animation.DROP,
	position: parliment
});
google.maps.event.addListener(marker, 'click', toggleBounce);










var ViewModel = function(){
	var self = this;
	this.catList = ko.observableArray([]);

	//lloop over each initial kat

	initialCats.forEach(function(catItem){
		self.catList.push( new Cat(catItem) );
	});
	//Need to make the cat
	this.currentCat = ko.observable( this.catList()[0] );
	/*
	this.currentCat = ko.observable(new Cat({




		//JUST FOR ONE CAT
		clickCount: 0,
		name: 'Tabby',
		imgSrc: 'img/434164568_fea0ad4013_z.jpg',
		imgAttribution: 'https://www.flickr.com/photos/bigtallguy/434164568',
		nicknames: ['TabTab', 'T-bone', 'Mr. T', 'Tabitha']
	}) );
	*/
	//Knockout handles almost all of the view to model nonsense. So we don't need to write as many out
	this.incrementCounter = function(){
		this.clickCount(this.clickCount() + 1 );
	};

	//

	this.setCat = function(clickedCat) {
		self.currentCat(clickedCat);
	};

}

//apply bindings to vew model
ko.applyBindings(new ViewModel());




















function loadData() {

    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');

    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");
    //MAKE STREET VARIABLES
    var street = $('#street').val();
    var city =  $('#city').val();
    var address = street + ', ' + city;
    // load streetview
    $greeting.text('So, you want to live at ' + address + '?');

    // make url
    var streetView = 'http://maps.googleapis.com/maps/api/streetview?size=600x400&location=' + address;

    //from udacity course, look at the append it's a body spot woot
    $body.append('<img class="bgimg" src="'+ streetView +'">');

    //NYT AJAX request now
    //New York Times API Key that I had to register for
    var NYTArticleAPIKey = '000173a466a102376321f0305ae688ad:0:72602592';
    //MAKE A URL VAR
    var nytURL = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + city + '&sort=newest&api-key=' + NYTArticleAPIKey;
    //$.getJSON();
    //parse
    //console.log it, use <li>
    $.getJSON( nytURL, function( data ) {
        //from udacity
        $nytHeaderElem.text('New York Times Articles About ' + city);
        console.log(data.response.docs);
        articles = data.response.docs;

        for (var i = 0; i < articles.length; i++) {
            var article = articles[i];
            $nytElem.append('<li> <a href="' + article.web_url + '">' + article.headline.main + '</a><p>' + article.snippet + '</p></li>');
        };

  }).error(function(e){
    $nytElem.text('New York Time Articles could not be loaded.');
  });

  //wikipedia api
  // Use .ajax(); url, datatype, no success function parameter so set it to a function that you want to run, <ul id="wikipedia-links"></ul>

  //Make a url var
  var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + city + '&format=json&callback=wikiCallback';
  //udacity said there was no way to have proper error handling on ajax and made this suggestion for a way to handle it was to wait this long and if there is nothing back then it was
  // an error.
  var wikiRequestTimeout = setTimeout(function(){
    $wikiElem.text("Failed to get wikipedia resources");
  }, 8000);

  $.ajax({
    //url could have gone between ( and { or placed here
    url: wikiURL,
    dataType: 'jsonp',
    //UDACITY has jsonp: "callback", some apis have the default function name callback
    //make the call back function
    success: function( response){
        console.log(response);
        console.log(response[0]);
        console.log(response[1]);

        var articleList= response[1];

        for (var i = 0; i < articleList.length; i++){
            articleStr = articleList[i];
            var url = 'http://en.wikipedia.org/wiki/' + articleStr;
            $wikiElem.append('<li><a href="' + url + '">' + articleStr + '</a></li>');
        };
        //If we don't use 'clearTimeout' then after we get the request the time out above var wikiRequestTimeout will override our data, not good
        clearTimeout(wikiRequestTimeout);
    }
  })





    return false;
};

$('#form-container').submit(loadData);