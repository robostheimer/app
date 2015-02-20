//'use strict';

/* Services */

//Checks to see if Geolocation is Activated.  If it is it creates a geolocation variable and sends them as parameters to HashCreate service////

///If Geolocation is not enabled, alerts user to the fact/////////
MusicWhereYouAreApp.factory("getLocation", ['$q', '$http', '$sce', 'PlaylistCreate', 'HashCreate','$rootScope',
function($q, $http, $sce, PlaylistCreate, HashCreate, $rootScope) {
	
	
	var zoom = 11;
	var currentLat = 41.5;
	var currentLong = -91.6;
	var deferred = $q.defer();
	$rootScope.genres='';
	$rootScope.tags=[];
	$rootScope.lookUpSongs=[];
	//console.log('geo:'+$rootScope.lookUpSongs)
	$rootScope.era='';
	//$rootScope.location = [];
	var Geolocation = {
		_checkGeoLocation : function() {
			////////Checks if Geolocation is available;
			/////If it is is runs the handle_geolocation_query or the handle Gelocation.handle)errors function if access to the Geolocation API is denied by the user
			
			navigator.geolocation.getCurrentPosition(Geolocation.handle_geolocation_query, Geolocation.handle_errors);
		},

		handle_geolocation_query : function(position) {

			
			currentLat = (position.coords.latitude);
			currentLong = (position.coords.longitude);
			var lat_min = currentLat - .25;
			var lat_max = currentLat + .25;
			var long_min = currentLong - .25;
			var long_max = currentLong + .25;
			////Creates a promise that runs the Playlist creation Function and then the Map Create function.
			HashCreate.runHash(currentLat, currentLong);
			
						

		},

		handle_errors : function(error) {
			alert('Uh Oh, Looks like there\'s NO Music Where You Are.  At Least not the type of Music You are Looking for.  And as Nietsche said, "A world (or in this case a geolocation) without music is a mistake."  To avoid an existential crisis, our advice at the MWYA Situation Room is to leave wherever you are as fast as you can. You might try enabling GPS on your device or clicking on the map icon in the lower righthand corner and type in a city and state/region in the field at the top of the page.');
			currentLat = 41.5;
			currentLong = 91.6
			lat_min = currentLat - .1;
			lat_max = currentLat + .1;
			long_min = currentLong - .1;
			long_max = currentLong + .25
			$rootScope.noSongs=true;
			switch(error.code) {
				case error.PERMISSION_DENIED:

					error = 'Choose a City and State from the form below or enable geolocation on your device.'
					break;

				case error.POSITION_UNAVAILABLE:
					error = 'We could not detect current position';
					break;

				case error.TIMEOUT:
					error = 'There was a server timeout.'
					break;

				default:
					error = 'There was an unknown error.';
					break;
			}
			
		},
	};
	return {
		checkGeoLocation : Geolocation._checkGeoLocation
	};
}]);




/////////////////Runs the geolocations through Echonest and filters results based on type of location (city, region or just region, removes duplicates, etc.)
////////////////Checks to see if any items in this playlist have been favorites
MusicWhereYouAreApp.factory('PlaylistCreate', ['$q', '$rootScope', '$http', '$sce', 'MapCreate', 'HashCreate','$location','$routeParams','States',
function($q, $rootScope, $http, $sce, MapCreate, HashCreate, $location, $routeParams, States) {
	

	return {
		 runPlaylist : function(zoom, lat, long,lat_min, lat_max, long_min, long_max, genres, era, start_number){
			var lsTitleArr=[];
			var lsIdArr=[];
			var lsTitleStr='';
			var lsIdStr='';
			var lsIdFavArr=[];
		 	var genresSplit = genres.split('**');
		 	var eraSplit=era.split('**');
		 	var finalgenres = '';
		 	var era1='';
		 	var era2='';
		 	
		 	for (var i=0; i<genresSplit.length; i++)
		 	{
		 		
		 		if(genresSplit.length>0&& genresSplit[i]!="")
		 		{
			 		if(genresSplit[i]!='holiday')
			 		{	
			 		finalgenres +='&style='+genresSplit[i];
			 		}
			 		else
			 		{
			 			finalgenres+='&song_type=christmas';
			 		}
		 		}
		 		
		 	}
		 	songs = {};
		 	 if(finalgenres=='' && era=='')
		 	{
			var url = 'http://developer.echonest.com/api/v4/song/search?api_key=3KFREGLKBDFLWSIEC&format=json&results=50&min_latitude=' + lat_min + '&max_latitude=' + lat_max + '&min_longitude=' + long_min + '&max_longitude=' + long_max + '&bucket=artist_location&bucket=id:spotify-WW&bucket=tracks&limit=true&&song_type=studio&rank_type=familiarity&song_min_hotttnesss=.3&start='+start_number;
			}
			else{
				var url = 'http://developer.echonest.com/api/v4/song/search?api_key=3KFREGLKBDFLWSIEC&format=json&results=50&min_latitude=' + lat_min + '&max_latitude=' + lat_max + '&min_longitude=' + long_min + '&max_longitude=' + long_max + '&bucket=artist_location&bucket=id:spotify-WW&bucket=tracks&limit=true&&song_type=studio&rank_type=familiarity&song_min_hotttnesss=.2&start='+start_number+finalgenres+era;
			}
			
			return $http.get(url).success(function(data) {
				
				var songs = data.response.songs;
				songs.songsArr=[];
				songs.songsArr.spot_arr = [];
			 	songs.songsArr.spot_playlist=[];
				songs.songsArr.location_arr = [];
				songs.songsArr.final_loc_arr=[];
				songs.songsArr.lat_min = lat_min;
				songs.songsArr.long_min = long_min;
				songs.songsArr.spot_str = '';
				var song_str = '';
				var location_str = '';
				var location_rp = $routeParams.location;
				var states = States.createStateObj();
				//var countries = States.createCountriesObj
				if(location_rp.split('*').length==1)
				{
					///StateAB/////////
					if(location_rp.length==2)
					{
						
						for(var yy=0; yy<states.length; yy++)
						{
							
							if(location_rp.toLowerCase() ==states[yy].abbreviation.toLowerCase())
							{
								location_rp1 = states[yy].name;
								location_rp2=states[yy].abbreviation;
								
							}
						
						}
					}
					else
					{
						//////////////State///////////
						//location_rp = location_rp.replace('*',', ');
						for(var yy=0; yy<states.length; yy++)
						{
							
							if(location_rp.replace(/_/g, ' ').toUpperCase() ==states[yy].name)
							{
								location_rp1 = states[yy].name;
								location_rp2=states[yy].abbreviation;
							}
							
							else 
							{
								location_rp1 = location_rp;
								//location_rp2=location_rp;
								
								
							}
						}
					}
				}
				else
				{
					 var location_rpS =location_rp.split('*')[1];
					////////////////City Region/////////////////
					 if(location_rpS.length==2)
					{
						
						for(var yy=0; yy<states.length; yy++)
						{
							if(location_rpS ==states[yy].abbreviation)
							{
								location_rp1 = states[yy].name;
								location_rp2=states[yy].abbreviation;
								
							}
						}
					}
					else
					{
						//location_rp = location_rp.replace('*',', ');
						for(var yy=0; yy<states.length; yy++)
						{
							if(location_rpS.toUpperCase() ==states[yy].name)
							{
								location_rp1 = states[yy].name;
								location_rp2=states[yy].abbreviation;
								
							}
						}
					
					}
					
					
				}
				////////////////////Local Storage////////////////////////
				/*var ls_removeOut = jQuery.parseJSON(localStorage.getItem('leaveOutArr'));
				var ls_str=''
				if(ls_removeOut!=null)
				{
					for (var xx=0; xx<ls_removeOut.length; xx++)
					{
						lsTitleArr.push(ls_removeOut[xx].song);
						lsIdArr.push(ls_removeOut[xx].id);
					}

				}
				else
				{
					lsTitleArr=[];
					lsIdArr=[];
				}
				
				
				var ls_favorite = jQuery.parseJSON(localStorage.getItem('FavoriteArr'))
				if(ls_favorite!=null)
				{
					for (var yy=0; yy<ls_favorite.length; yy++)
					{
						lsIdFavArr.push(ls_favorite[yy].id)
					}
				}
				else
				{
					lsIdFavArr=[];
				}*/
				
				///////////////////////End Local Storage/////////////////////
				
				
				
				for (var x = 0; x < songs.length; x++) {
					
					var songtitle=songs[x].title
					
					///////////////////City Region//////////////////////
						if(location_rp.split('*').length==1)
						{
						/////////////////////////check for song against Local Storage so LeaveOuts are left out///////////////////////////////////	
						if (!song_str.toLowerCase().replace(/\W/g,' ').match(songtitle.toLowerCase().replace(/\W/g,' '))&&!lsIdArr.toString().replace(/\W/g, '').match(songs[x].id.replace(/\W/g,'')) && !lsTitleArr.toString().toLowerCase().replace(/\W/g, '').match(songs[x].title.toLowerCase().replace(/\W/g,'')))
						{
							if((songs[x].artist_location.location.replace(/\W/g, '').toUpperCase().match(location_rp1.replace(/\W/g, '').toUpperCase()))||(songs[x].artist_location.location.replace(/\W/g, '').toUpperCase().match(location_rp2.replace(/\W/g, '').toUpperCase())))
							{
							
									
							if(songs[x].title == null || songs[x].artist_location == null||songs[x].artist_location.location==null || songs[x].id == null)
							{
							
							x=x+1;
							}
							
							if(lsIdFavArr.toString().replace(/\W/g, '').match(songs[x].id))
								{
								songs[x].favorite='on';
								}
							else
								{
								songs[x].favorite='off';
								}
							songs[x].closeButton=false;
							
							songs[x].num_id=x;
							songs[x].id=x;
							songs.songsArr.push(songs[x]);
							songs.songsArr.spot_arr.push("spotify:track:"+songs[x].id);
							songs.songsArr.spot_playlist.push(songs[x].id);
							songs.songsArr.spot_str+=songs[x].id+',';
							//songs.push(songs[x]);
							
							//spot_arr.push(songs[x].id);
							song_str += songtitle;
							
							//artistlocation=songs[x].artist_location.location.replace(/ /g, '*');
							
							//songs.songsArr.location_arr.push(songs[x].artist_location.location +'@@'+songs[x].artist_location.latitude + ':' + songs[x].artist_location.longitude+'&&<h5>'+songs[x].title+'</h5><p>'+songs[x].artist_name+'</p><a href="spotify:track:'+songs[x].id+'" target="_blank"><div class="spot_link"  aria-hidden="true" data-icon="c" id="infobox_spot_link"+x></div></a><a><a a href="#/info/'+artistlocation+'/'+songs[x].artist_name.replace('The ', '')+'" ><div style="font-size:20px" class="spot_link information" id="infobox_info"+x  aria-hidden="true" data-icon="*"></div></a><div style="clear:both"></div>');
							
								}
							
							}
						}
					else{
						//////////////////////////State////////////////////////
						/////////////////////////check for song against Local Storage so LeaveOuts are left out///////////////////////////////////	
						
						if (!song_str.toLowerCase().replace(/\W/g,' ').match(songtitle.toLowerCase().replace(/\W/g,' '))&&!lsIdArr.toString().replace(/\W/g, '').match(songs[x].id.replace(/\W/g,'')) && !lsTitleArr.toString().toLowerCase().replace(/\W/g, '').match(songs[x].title.toLowerCase().replace(/\W/g,'')))
						{
							
								
							
						if(songs[x].title == null || songs[x].artist_location == null||songs[x].artist_location.location==null || songs[x].id == null)
						{
							
						x=x+1;
						}
						
						if(lsIdFavArr.toString().replace(/\W/g, '').match(songs[x].id))
							{
							
							songs[x].favorite='on';
							}
						else
							{
							songs[x].favorite='off';
							}
						songs[x].closeButton=false;
						songs[x].num_id=x;
						//songs[x].favorite='off'
						songs[x].id=x;
						songs.songsArr.push(songs[x]);
						songs.songsArr.spot_arr.push("spotify:track:"+songs[x].id);
						songs.songsArr.spot_playlist.push(songs[x].id);
						songs.songsArr.spot_str+=songs[x].id+',';
						//songs.push(songs[x]);
						
						//spot_arr.push(songs[x].id);
						song_str += songtitle;
						
						//artistlocation=$routeParams.location;
						
						//songs.songsArr.location_arr.push(songs[x].artist_location.location +'@@'+songs[x].artist_location.latitude + ':' + songs[x].artist_location.longitude+'&&<h5>'+songs[x].title+'</h5><p>'+songs[x].artist_name+'</p><a href="spotify:track:'+songs[x].id+'" ><div class="spot_link"  aria-hidden="true" data-icon="c" id="infobox_spot_link"+x></div></a><a><a a href="#/info/'+artistlocation+'/'+songs[x].artist_name.replace('The ', '')+'" ><div style="font-size:20px" class="spot_link information" id="infobox_info"+x  aria-hidden="true" data-icon="*"></div></a><div style="clear:both"></div>');
						
			
								
							}
					}
				}
				/*songs.songsArr.location_arr.sort();
				for (var r=0; r<songs.songsArr.location_arr.length; r++)
				{
					if(!location_str.match(songs.songsArr.location_arr[r].split('@@')[0]))
					{
					songs.songsArr.final_loc_arr.push('%%'+songs.songsArr.location_arr[r]);
					location_str += songs.songsArr.location_arr[r].split('@@')[0];
					}
					else
					{
						songs.songsArr.final_loc_arr.push(songs.songsArr.location_arr[r].split('@@')[1].split('&&')[1]);
						
					}
				}*/	
				
				//songs.songsArr.spot_str = 'https://embed.spotify.com/?uri=spotify:trackset:PREFEREDTITLE:' + songs.songsArr.spot_str;
				//console.log(songs.songsArr.spot_str)
				
				//songs.songsArr.spot_str = $sce.trustAsResourceUrl(songs.songsArr.spot_str);
			
					/*if(songs.songsArr.spot_playlist==0)
					{
						
						songs.noSongs=true;
						
					}
					else
					{
					songs.noSongs=false;
					}*/
				
				
				return songs;
				
			});
		 	},
		 	
		 	
		 	
		 	
	};
}]);



/////////////////////Takes multiple variables from the PlaylistCreate function and creates a google map with markers for where the artists are from/////////////////
MusicWhereYouAreApp.factory('MapCreate', ['$q', '$http', '$sce','$rootScope',
function($q,  $http, $sce, $rootScope) {
	
	return {
		runMap :function(zoom,lat, long, arr, spot_arr){
		console.log(lat+','+ long+':'+zoom);
		
		styles=[{"featureType":"landscape","stylers":[{"color":"#fefef3"},{"saturation":100},{"lightness":40.599999999999994},{"gamma":.75}]},{"featureType":"road.highway","stylers":[{"hue":"#FFC200"},{"saturation":-61.8},{"lightness":45.599999999999994},{"gamma":1}]},{"featureType":"road.arterial","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":51.19999999999999},{"gamma":1}]},{"featureType":"road.local","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":52},{"gamma":1}]},{"featureType":"water","stylers":[{"hue":"#0078FF"},{"saturation":-13.200000000000003},{"lightness":30.4000000000000057},{"gamma":.75}]},{"featureType":"poi","stylers":[{"hue":"#00FF6A"},{"saturation":-1.0989010989011234},{"lightness":11.200000000000017},{"gamma":1}]}];
			$rootScope.noSongs=false;
			var loc_arr=[];
			var loc_arr_string = arr.toString().replace(/<\/p>,/g, '');
			loc_arr_string = loc_arr_string.replace(/,%%/g, '%%');
			var loc_arr = loc_arr_string.split('%%');
			var LatLng = new google.maps.LatLng(lat, long);
			var infowindow_textArr =[];
			var mapOptions = {
				center : LatLng,
				zoom : zoom,
				mapTypeId : google.maps.MapTypeId.ROADMAP,
				draggable : true,
				 styles: styles
				
			};
			
			var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
			var iw_content=''
			var marker_image = 'genre_icons/marker_sm.svg';
			for (var i = 1; i < loc_arr.length; i++) {
				iw_content+=('<b>'+loc_arr[(i)].split('@@')[0].replace(/, US/g,'')+'</b><br/>'+loc_arr[(i)].split('&&')[1].replace(/,\<h5\>/g, '<h5>'))
				var LatLng_marker = new google.maps.LatLng(loc_arr[i].split('@@')[1].split(':')[0], loc_arr[i].split('@@')[1].split(':')[1].split('&&')[0]);
				var geomarker = new google.maps.Marker({
					position : LatLng_marker,
					map : map,
					icon : marker_image
				});
				var infowindow = new google.maps.InfoWindow();
				var geomarker, i;
				//infowindow_textArr.push('<b>'+loc_arr[(i-1)].split('@@')[0].replace(/, US/g,'')+'</b><br><br/>'+loc_arr[(i-1)].split('&&')[1]);
				
				

					google.maps.event.addListener(geomarker, 'click', (function(geomarker, i) {
						return function() {
														
							infowindow.setContent('<b>'+loc_arr[(i)].split('@@')[0].replace(/, US/g,'')+'</b><br/>'+loc_arr[(i)].split('&&')[1].replace(/,\<h5\>/g, '<h5>')+'<br/>');
							infowindow.open(map, geomarker);
						};
					})(geomarker, i));
					
				
			}	
		} 
	};
}]);

MusicWhereYouAreApp.factory('LocationDataFetch', [ 'retrieveLocation',
function(location, latorlng) {
	//return {
	var locationdata = {};
	

	locationdata.count = 0;
	return locationdata;
	//};
}]);

MusicWhereYouAreApp.factory("retrieveLocation", ['$q', '$rootScope', '$http', '$sce', '$window', '$location','States',
function($q, $rootScope, $http, $sce, $window,$location, States, $routeParams) {
	//////////////////////MAKE WORK for LOWERCASE
	//////////////Manipulate strings so all items look like, 'Test, TS' to the program//////////////
	return {
		runLocation : function(location, latorlng, ratio) {
			//$rootScope.lookUpSongs=[];
			var location = location.replace('*',', ');
			var lat_min;
			var long_min;
			var long_max;
			var lat_max;
			var latitude;
			var longitude;
			var lats = Number();
			var longs = Number();
			var geolocation ={};
			var states = States.createStateObj();
			
			if (location.split(' ').length > 1 && location.match(',')) {
				var zoom = 10;
				///////city+full state//////
				if (location.split(',')[1].replace(' ', '').length > 2) {
					var locationSplit = location.split(',');
					var loc1 = toTitleCase(locationSplit[0]);
					var loc2 = toTitleCase(locationSplit[1].replace(' ', ''));
				}	
				else
				{
					location = location.replace('_', ' ');
					var ab = location.split(', ')[1].split(' ')[0].toUpperCase();
					
					
					for(var x=0; x<states.length; x++)
					{
						
						if(states[x].abbreviation==ab)
						{
							var state =(states[x].name);
							
							var locationSplit = location.split(',');
							var loc1 = toTitleCase(locationSplit[0]);
							var loc2 = toTitleCase(state);
							
						}
					}
					
				}	
					var lat_url = 'https://www.googleapis.com/fusiontables/v1/query?sql=SELECT+Lat,Region,CityName,CountryID+FROM+1_7XFAaYei_-1QN5dIzQQB8eSam1CL0_0wYpr0W0G+WHERE+Region=%27'+loc2.toUpperCase()+'%27+AND+CityName=%27'+loc1.toUpperCase()+'%27+ORDER%20BY+Lat&key=AIzaSyBBcCEirvYGEa2QoGas7w2uaWQweDF2pi0';
					var long_url = 'https://www.googleapis.com/fusiontables/v1/query?sql=SELECT+Long,Region,CityName,CountryID+FROM+1_7XFAaYei_-1QN5dIzQQB8eSam1CL0_0wYpr0W0G+WHERE+Region=%27'+loc2.toUpperCase()+'%27+AND+CityName=%27'+loc1.toUpperCase()+'%27+ORDER%20BY+Long&key=AIzaSyBBcCEirvYGEa2QoGas7w2uaWQweDF2pi0';
					if(latorlng=="lat")
					{
					return	$http.get(lat_url).then(function(data){
						console.log(data)
						if (data.data.rows != null) {
							for(var j=0; j<data.data.rows.length;j++)
								{
									lats += parseFloat(data.data.rows[j][0]);
									
								}
							geolocation.latitude=lats/data.data.rows.length;
							geolocation.lat_min = data.data.rows[0][0] - ratio;
							
							geolocation.lat_max=data.data.rows[(data.data.rows.length-1)][0] + ratio;
							geolocation.location = location;
							geolocation.country = data.data.rows[0][3];
						} else {
							$rootScope.noSongs=true;
						}	
						return (geolocation);
					});
					}
					else
					{
					
					return	$http.get(long_url).then(function(data){
						
						if (data.data.rows != null) {
							for(var j=0; j<data.data.rows.length;j++)
								{
									longs += parseFloat(data.data.rows[j][0]);
									
								}
							geolocation.longitude=longs/data.data.rows.length;;
							geolocation.long_min = data.data.rows[0][0] - ratio;
							geolocation.long_max=data.data.rows[(data.data.rows.length-1)][0] + ratio;
							geolocation.location = location;
							geolocation.country = data.data.rows[0][3];
						} else {
							$rootScope.noSongs=true;
						}
						return (geolocation);
					});
					}
					
				 
				
				}
				
				else {
				var zoom = 6;
				///Full State
				if(location.length==2)
				{
					var ab = location.toUpperCase();
					
					
					for(var x=0; x<states.length; x++)
					{
						
						if(states[x].abbreviation==ab)
						{
							var location =(states[x].name.toLowerCase());
							
							
						}
					}
				}
				else {
					var location =location;
				}	
					var lat_url = 'https://www.googleapis.com/fusiontables/v1/query?sql=SELECT+Lat,Region,CityName,CountryID+FROM+1_7XFAaYei_-1QN5dIzQQB8eSam1CL0_0wYpr0W0G+WHERE+Region=%27'+location.toUpperCase()+'%27+ORDER%20BY+Lat&key=AIzaSyBBcCEirvYGEa2QoGas7w2uaWQweDF2pi0';
					var long_url = 'https://www.googleapis.com/fusiontables/v1/query?sql=SELECT+Long,Region,CityName,CountryID+FROM+1_7XFAaYei_-1QN5dIzQQB8eSam1CL0_0wYpr0W0G+WHERE+Region=%27'+location.toUpperCase()+'%27+ORDER%20BY+Long&key=AIzaSyBBcCEirvYGEa2QoGas7w2uaWQweDF2pi0';
					

					location = toTitleCase(location);
					if(latorlng=="lat")
						{
						return	$http.get(lat_url).then(function(data){
							if (data.data.rows != null) {
								geolocation.latitude=data.data.rows[0][0];
								geolocation.lat_min = data.data.rows[0][0] - ratio
								geolocation.lat_max=data.data.rows[(data.data.rows.length-1)][0] + ratio;
								geolocation.location = location;
								geolocation.country = data.data.rows[0][3];
							} else {
								$rootScope.noSongs=true;
							}	
							return (geolocation);
						});
						}
						else
						{
						
						return	$http.get(long_url).then(function(data){
							if (data.data.rows != null) {
								geolocation.longitude=data.data.rows[0][0];
								geolocation.long_min = data.data.rows[0][0] - ratio;
								geolocation.long_max=data.data.rows[(data.data.rows.length-1)][0] + ratio;
								geolocation.location = location;
								geolocation.country = data.data.rows[0][3];
							} else {
								$rootScope.noSongs=true;
							}
							return (geolocation);
						});
						}

					
					}
					
			
		}	
	};
	
}]);




MusicWhereYouAreApp.factory("HashCreate", ['$q', '$rootScope', '$http', '$sce','$location','$routeParams',
function($q, $rootScope, $http, $sce, $location, $routeParams) {
	return{
			runHash : function(lat, lng) {
			
			var url = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT+CityName%2C+Region+FROM+1B8NpmfiAc414JhWeVZcSqiz4coLc_OeIh7umUDGs+WHERE+Lat+<=" + (lat+.05) + "+AND+Lat>=" + (lat - .05) + "+AND+Long<=" + (lng+.05) + "+AND+Long>=" + (lng -.05) + "&key=AIzaSyBBcCEirvYGEa2QoGas7w2uaWQweDF2pi0";
			$http.get(url).success(function(data) {
				if (data.rows != null) {
					var deferred = $q.defer();
					var city = data.rows[0][0];
					var state = data.rows[0][1];
					if (city.split(' ') > 1) {
						city = city.replace(/ /g, '_');
					}
					if (state.split(' ') > 1) {
						state = state.replace(/ /g, '_');
					}
					var location = city + '*' +state+'/';
					;
				} else {
					var location = "";
				}

				var hashy = $location.path().split('/')[1].split('/')[0];

				//window.location.href = '#'/hashy + '/' + location;
				$location.path(hashy+'/'+location.replace(/ /g, '_'));
				
				
			});
		}
	};	
}]);

MusicWhereYouAreApp.factory("loadGenreCheckData", ['$routeParams','$http',
function($routeParams, $http){
	return {
			  getGenre: function() {
				
			var Genre=[{genre: {checked : false,isSelected : false, state: 'off',  genre: 'avant garde', similarGenres: 'avant garde**avant garde jazz**avant garde metal', year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',  genre: 'blues', similarGenres: 'blues**blues guitar**blues revival**blues rock**blues-rock**british blues**chicago blues**classic blues**contemporary blues**country blues**delta blues**electric blues**juke joint blues louisiana blues**memphis blues**modern blues**modern electric blues**new orleans blues**slide guitar blues**soul blues**texas blues', year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',  genre: 'classic rock', similarGenres: 'classic rock' , year_end:''}}, {genre : {checked : false, isSelected : false, state: 'off',  genre: 'classical', similarGenres: 'classical**classical pop**contemporary classical music**crossover classical**modern classical', year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',  genre: 'comedy', similarGenres:'comedy**comedy rock', year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',  genre: 'country', similarGenres: 'country rock**alternative country**country**honky tonk**cowboy punk**classic country**modern country**hillbilly**rockabilly**bluegrass**country pop**outlaw country**pop country**progressive country**texas country', year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',  genre: 'drama', similarGenres: 'drama', year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',  genre:'electronic', similarGenres: 'electronic**electro**electro hip hop**electro house**electro rock**electro-funk**electro-industrial**electro jazz**experimental electronic**indie electronic', year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',  genre:'folk', similarGenres: 'folk**acid folk**alternative folk**contemporary folk**country folk**electric folk**folk pop**folk revival**folk rock**folk pop**indie folk**neo folk**pop folk**psychedelic folk**stomp and holler**traditional folk**urban folk', year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',  genre: 'hip hop', similarGenres:'hip hop**classic hip hop**rap**west coast hip hop**alternative hip hop**east coast hip hop**electro hip hop**experimental hip hop**independent hip hop**indie hip hop**jazz hip hop**old school hip hop**southern hip hop', year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',   genre: 'holiday', similarGenres: 'holiday', year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',  genre: 'indie', similarGenres: 'indie rock**geek rock**lo fi**math rock**indie folk**indie hip hop**indie**indy', year_end:''}}, {genre : {checked : false, isSelected : false, state: 'off',  genre : 'jazz', similarGenres: 'jazz**jazz blues**jazz funk**jazz fusion**jazz hip hop**jazz rock**jazz vocal**latin jazz**modern jazz**new orleans jazz**soul jazz**traditional jazz' , year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',  genre: "kid music", similarGenres:'children\'s music', year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',  genre : 'latin', similarGenres: 'latin**latin jazz**jazz latino**latin alternative**latin folk**latin hip hop**latin pop**latin music**latin rap**latin rock**latin ska', year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',  genre : 'new age', similarGenres:'new age**new age music', year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',  genre: 'motown', similarGenres: 'motown**classic motown**soul**memphis soul**old school soul**soul music**soul', year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',  genre: 'pop', similarGenres:'pop 60s pop**80s pop**acoustic pop**alternative pop**pop rock**dance pop**folk pop**jangle pop**pop country**pop punk**pop rap**pop folk**psychedelic pop', year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',  genre: 'punk', similarGenres: 'punk**punk rock**acoustic punk**art punk**anarcho punk**classic punk**cowpunk**dance-punk**cyberpunk**emo punk**folk punk**garage punk**hardcore punk**indie punk**old school punk**political punk**skate punk**street punk', year_end:''}},{genre : {checked : false,isSelected : false, state: 'off',  genre: 'rock', similarGenres: 'rock**punk rock**classic rock**college rock**dance rock**electro rock**folk rock**garage rock**jam band**hard rock**modern rock**psychedelic stoner rock**punk**southern rock**80s rock**90s rock**70s rock**60s rock**alternative rock**acoustic rock**acid rock', year_end:''}}, {genre : {checked : false,isSelected : false, state: 'off',  genre: 'soft rock', similarGenres: 'soft rock**easy listening', year_end:''}}, {genre: {checked : false,isSelected : false, state: 'off',  genre: 'world', similarGenres: 'world world music**world beat**world fusion', year_end:''}}];	
	
	
	return Genre;
	},
	getEra: function() {
			var d=new Date();	
			var Era=[{era: {checked : false,isSelected : false, state: 'off',  era: 'twentyten', year_begin: '2010', year_end: d.getFullYear()}},{era: {checked : false,isSelected : false, state: 'off',  era: 'twenty', year_begin: '2000', year_end:'2009'}},{era: {checked : false,isSelected : false, state: 'off',  era: 'nineteenninty', year_begin: '1990', year_end:'1999'}}, {era: {checked : false,isSelected : false, state: 'off',  era: 'nineteeneighty', year_begin: '1980', year_end:'1989'}},{era: {checked : false,isSelected : false, state: 'off',  era: 'nineteenseventy', year_begin: '1970', year_end:'1979'}}, {era: {checked : false,isSelected : false, state: 'off',  era: 'nineteensixty', year_begin: '1960', year_end:'1969'}}, {era: {checked : false,isSelected : false, state: 'off',  era: 'nineteenfifty', year_begin: '1950', year_end:'1959'}},{era: {checked : false,isSelected : false, state: 'off',  era: 'nineteenforty', year_begin: '1940', year_end:'1949'}}, {era: {checked : false,isSelected : false, state: 'off',  era: 'nineteenthrity', year_begin: '1930', year_end:'1939'}}, {era: {checked : false,isSelected : false, state: 'off',  era: 'nineteentwenty', year_begin: '1920', year_end:'1929'}}, {era: {checked : false,isSelected : false, state: 'off',  era: 'nineteenten', year_begin: '1910', year_end:'1919'}}, {era: {checked : false,isSelected : false, state: 'off',  era: 'nineteen', year_begin: '1900', year_end:'1909'}}, {era: {checked : false,isSelected : false, state: 'off',  era: 'eighteenninty', year_begin: '1890', year_end:'1899'}}, {era: {checked : false,isSelected : false, state: 'off',  era: 'eighteeneighty', year_begin: '1880', year_end:'1889'}},{era: {checked : false,isSelected : false, state: 'off',  era: 'eighteenseventy', year_begin: '1870', year_end:''}}, {era: {checked : false,isSelected : false, state: 'off',  era: 'eighteensixty', year_begin: '1860', year_end:'1869'}}];	
	
	return Era;
	},
	
	getMood: function() {
				
			var Mood=[{mood: {checked : false,isSelected : false, state: 'off',  mood: 'happy', year_end:''}},{mood: {checked : false,isSelected : false, state: 'off',  mood: 'angry', year_end:''}},{mood: {checked : false,isSelected : false, state: 'off',  mood: 'sad', year_end:''}},{mood: {checked : false,isSelected : false, state: 'off',  mood: 'sexy', year_end:''}}, {mood: {checked : false,isSelected : false, state: 'off',  mood: 'quiet', year_end:''}}, {mood: {checked : false,isSelected : false, state: 'off',  mood: 'dark', year_end:''}}, {mood: {checked : false,isSelected : false, state: 'off',  mood: 'epic', year_end:''}}, {mood: {checked : false,isSelected : false, state: 'off',  mood: 'party_music', year_end:''}}, {mood: {checked : false,isSelected : false, state: 'off',  mood: 'intense', year_end:''}},{mood: {checked : false,isSelected : false, state: 'off',  mood: 'rowdy', year_end:''}}, {mood: {checked : false,isSelected : false, state: 'off',  mood: 'cheerful', year_end:''}}, {mood: {checked : false,isSelected : false, state: 'off',  mood: 'carefree', year_end:''}}, {mood: {checked : false,isSelected : false, state: 'off',  mood: 'energetic', year_end:''}},{mood: {checked : false,isSelected : false, state: 'off',  mood: 'laid-back', year_end:''}}, {mood: {checked : false,isSelected : false, state: 'off',  mood: 'rebellious', year_end:''}}];	
	
	
	return Mode;
	},
	
	loadEchonestStyles:function()
	{
		var url ='http://developer.echonest.com/api/v4/artist/list_terms?api_key=3KFREGLKBDFLWSIEC&format=json&type=style'
     			
     			
     			return $http.get(url).then(function(result)
     			{
     				var genres= result.data.response.terms
     				
     				return genres;
     			});
     			
	}		  
	
};
}]);

MusicWhereYouAreApp.factory("runSymbolChange", ['$rootScope','$location', function($rootScope, $location)
{
	return {
		addButtons:function()
		{
			var genre_class = {}
			var playlist_class = {};
			var favorite_class = {};
			var map_class = {};
			var jukebox_class = {};
			var roadsoda_class = {};
			//menuPos=true;
			genre_class.name = 'genre';
			genre_class.classy = "iconequalizer12";
			genre_class.state = 'off';
			//genre_class.href = '#/genres/' + location;
		
			playlist_class.name = 'playlist';
			playlist_class.classy = "icon-song";
			playlist_class.state = 'off';
			//playlist_class.href = '#/playlist/' + location;
		
			favorite_class.name = 'favorite';
			favorite_class.classy = "iconfavorite";
			favorite_class.state = 'off';
			//favorite_class.href = '#/favorites/' + location;
		
			map_class.name = 'map';
			map_class.classy = "iconmap";
			map_class.state = 'off';
			//map_class.href = '#/map/' + location;
		
			jukebox_class.name = 'jukebox';
			jukebox_class.classy = "jukebox";
			jukebox_class.state = 'off';
			//jukebox_class.href = '#/jukebox/' + location;
			
			roadsoda_class.name = 'roadsoda';
			roadsoda_class.classy = "roadsoda";
			roadsoda_class.state = 'off';
			//roadsoda_class.href = '#/roadsoda/' + location;
		
			icons = [genre_class, playlist_class, favorite_class, map_class, jukebox_class];
			$rootScope.icons = icons;
			return icons;
		},
		
		changeSymbol: function(state, obj, classy ,url, link, object2)
		{
		if($rootScope.icons!=undefined)
		{
		for(var i=0; i<$rootScope.icons.length; i++)
			{
				
				
				$rootScope.icons[i].state='off';
				
				
			
				if($location.path().match($rootScope.icons[i].name))
				{
					$rootScope.icons[i].state ='on';
					
				}
			};
			
		}	
		
			
			
		
		
		
	}
};
	
}]);

MusicWhereYouAreApp.factory("retrieveInfo", ['$q', '$rootScope', '$http', '$sce', '$location',
function($q, $rootScope, $http, $sce, $location) {
return{
	
     		infoRetrieve: function(artistname){
     			var artistinfo = {};
     			var artistname_echo = artistname.replace(/\*/g, ' ');
     		
     			//var feed = 'http://teacheratsea.wordpress.com/category/'+$routeParams.teachername.split('*')[0].toLowerCase()+'-'+$routeParams.teachername.split('*')[1].toLowerCase()+'/feed';
     			
     			var url ='http://developer.echonest.com/api/v4/artist/search?api_key=3KFREGLKBDFLWSIEC&format=json&name='+artistname_echo+'&results=1&bucket=songs&bucket=biographies&bucket=images&bucket=id:spotify-WW&limit=true&bucket=video&bucket=news&bucket=artist_location&rank_type=familiarity'
     			
     			
     			return $http.get(url).then(function(result)
     			{
     				
					
     				
     			artistinfo =result.data.response.artists[0];
       			artistinfo.spot_url=[];
     			artistinfo.bio={};
     			artistinfo.bio.text='';
     			artistinfo.ytArr=[];
     			artistinfo.videoArr=[];
     			artistinfo.lastfm_imgs=[];
     			
	     			for (var f=0; f<artistinfo.video.length; f++)
	     			{
	     			if(artistinfo.video[f].url.match('youtube'))
		     			{
		     			artistinfo.ytArr.push(artistinfo.video[f].url);
		     			}
	     			}
     			
	     			for (var g=0; g<artistinfo.news.length; g++)
	     			{
	     				
		     			artistinfo.news[g].news_summary=removeHTML(artistinfo.news[g].summary);
		     			
	     			}
     			if(artistinfo.ytArr.length<7)
     			{
     			var yt_length = artistinfo.ytArr.length;
     			}
     			else{
     			var yt_length = 7;
     			}
     			for(var g=0; g<yt_length; g++)
	     			{
	     				
	     				artistinfo.videoArr.push($sce.trustAsResourceUrl('http://www.youtube.com/embed/'+artistinfo.ytArr[g].slice(artistinfo.ytArr[g].indexOf('?v='),artistinfo.ytArr[g].indexOf('&feature')).replace('?v=','')));
	     			}
     			
     			
	     			for(var i=0; i<artistinfo.biographies.length; i++)
	     			{
	     				
	     				if(artistinfo.biographies[i].site.match('last.fm'))
	     				{
	     					artistinfo.bio=result.data.response.artists[0].biographies[i];
	     					if(artistinfo.bio.text.length>2700)
	     					{
	     						artistinfo.bio.text = textSlicer(artistinfo.bio.text, 2700) +'... ';
								artistinfo.bio_site = 'Read More at ' +artistinfo.bio.site;
	     					}
	     					else
		     				{
		     					artistinfo.bio_site = 'Courtesy of ' +artistinfo.bio.site;
		     				}
	     				}
	     				
	     				
	     			}
     			
     			if(artistinfo.bio.text=='')
     			{
     				artistinfo.bio.text='No published biography exists for this band.';
     			}
     			
     			for(var h=0; h<artistinfo.images.length; h++)
     			{
     				if(artistinfo.images[h].url.match('last.fm'))
	     					{
	     						if(artistinfo.images[h].url.match('serve'))
	     						{
	     						var img_id = artistinfo.images[h].url.split('serve/')[1]
	     						img_id=img_id.slice(artistinfo.images[h].url.split('serve/')[1].indexOf('/'),artistinfo.images[h].url.split('serve/')[1].length);
	     							
	     						artistinfo.images[h].src ='http://userserve-ak.last.fm/serve/126s'+img_id;	
	     						
	     									
	     						artistinfo.lastfm_imgs.push(artistinfo.images[h]);
	     						 }    						
	     					}
	     				}
	     				if(artistinfo.images.length==0)
	     				{
	     					for (var y=0; y<5; y++)
	     					{
	     					artistinfo.images.push('logo4_sm.png');	     				
	     					}
	     				}
     			
     			
     			return artistinfo;
		});	
		
	},
     		imagesRetrieve: function(artistname){
     			var artistimages = {};
     			
     			
     			var url ='php/wikimedia.php?q='+artistname.replace(/\*/g,' ')+'music';
     			
     			
     			return $http.get(url).success(function(result)
     			{
	
     			artistimages =(result.data);
     			
     			return artistimages;
		});	
		
	},
			lookUpArtist :function(artistname)
			{
				
				
				var url = 'https://api.spotify.com/v1/search?q="'+artistname+'"&type=artist&limit=1';
				return $http.get(url).success(function(result)
     			{
					var artistid= result.artists.items[0].id;
					return artistid;
					
		});	
			},
			spotifyRetrieve :function(id)
			{
				return $http.get('https://api.spotify.com/v1/artists/'+id+'/top-tracks?country=US').success(function(result){
						artistsongs =result;
     					artistsongs.spot_url=[];
     					artistsongs.spot_url_button=[];
						
     			
     			
     			for(var i=0; i<artistsongs.tracks.length; i++)
	     			{
	     				
	     				artistsongs.spot_url.push(artistsongs.tracks[i].id);
	     				artistsongs.spot_url_button.push(artistsongs.tracks[i].id);
	     				
	     			}
     			artistsongs.spot_url_str = $sce.trustAsResourceUrl('https://embed.spotify.com/?uri=spotify:trackset:PREFEREDTITLE:'+artistsongs.spot_url.toString());
     			return artistsongs;
     			});
			},
			
			relatedRetrieve: function(artistname)
			{
				
				relatedartists={};
			
				var url ='http://developer.echonest.com/api/v4/artist/similar?api_key=3KFREGLKBDFLWSIEC&format=json&name='+artistname+'&results=10&&bucket=id:spotify-WW&bucket=images&bucket=artist_location';
				return $http.get(url).success(function(result)
     			{
     			relatedartists =result.response.artists;
     			relatedartists.relatedartistsfinal = [];	
     			for(var i=0; i<relatedartists.length; i++)
	     			{
	     				if(relatedartists[i].artist_location!=null)
	     				{
	     				relatedartists.relatedartistsfinal.push(relatedartists[i]);
	     				
	     				
	     				}
	     			}
	     			
	     			for(var x=0; x<relatedartists.relatedartistsfinal.length; x++)
	     			{	
	     				relatedartists.relatedartistsfinal[x].href = '#/info/'+$location.path().split('/')[2]+'/'+relatedartists.relatedartistsfinal[x].name.replace('The ', '');
	     				relatedartists.relatedartistsfinal[x].lastfm_imgs =[];
	     				for(var u=0; u<relatedartists.relatedartistsfinal[x].images.length; u++)
	     				{
	     					if(relatedartists.relatedartistsfinal[x].images[u].url.match('last.fm'))
	     					{
	     						if(relatedartists.relatedartistsfinal[x].images[u].url.match('serve'))
	     						{
	     						var img_id = relatedartists.relatedartistsfinal[x].images[u].url.split('serve/')[1]
	     						img_id=img_id.slice(relatedartists.relatedartistsfinal[x].images[u].url.split('serve/')[1].indexOf('/'),relatedartists.relatedartistsfinal[x].images[u].url.split('serve/')[1].length);
	     						
	     						relatedartists.relatedartistsfinal[x].images[u].src ='http://userserve-ak.last.fm/serve/126s'+img_id;	
	     									
	     						relatedartists.relatedartistsfinal[x].lastfm_imgs.push(relatedartists.relatedartistsfinal[x].images[u]);
	     						
	     						}
	     					}
	     				}
	     				
	     				if(relatedartists.relatedartistsfinal[x].lastfm_imgs.length==0)
	     				{
	     					relatedartists.relatedartistsfinal[x].lastfm_imgs.push({src:'/MusicWhereYouAre/logo4_sm.png'});	     				
	     				}
	     				
	     				
	     				
	     			}
	     			
						
	     			return relatedartists;
     			});
			},
	
	
			     createObjects: function() {	
					
					var buttons={};
					buttons.bio={};
					buttons.photos={};
					buttons.videos={};
					buttons.topsongs={};
					buttons.news={};
					buttons.related={};
					
					buttons.bio.name='bio';
					buttons.bio.classy= "shower";
					buttons.bio.state='on';
					//buttons.bio.href='#/'+$routeParams.year+'/'+$routeParams.teachername+'/blogs';
					
					buttons.photos.name='photos';
					buttons.photos.classy= "hider";
					buttons.photos.state='off';
					//buttons.photos.href=$routeParams.year+'/'+$routeParams.teachername+'/blogs';
					
					buttons.videos.name='videos';
					buttons.videos.classy= "hider";
					buttons.videos.state='off';
					//buttons.videos.href=$routeParams.year+'/'+$routeParams.teachername+'/videos';
					
					buttons.topsongs.name='top songs';
					buttons.topsongs.classy= "hider";
					buttons.topsongs.state='off';
					//buttons.topsongs.href=$routeParams.year+'/'+$routeParams.teachername+'/lessons';
					
					buttons.news.name='news';
					buttons.news.classy= "hider";
					buttons.news.state='off';
					//buttons.news.href=$routeParams.year+'/'+$routeParams.teachername+'/news';
					
					buttons.related.name='Related Artists';
					buttons.related.classy= "hider";
					buttons.related.state='off';
					//buttons.related.href=$routeParams.year+'/'+$routeParams.teachername+'/ship';
					return buttons;
				},
	
};
}]);


MusicWhereYouAreApp.factory('Favorites', ['$http', '$routeParams', '$location', '$rootScope', '$sce',
function($http, $routeParams, $location, $rootScope, $sce) {
	return {
		
		addFavorites:function()
		{
			if(localStorage.getItem('FavoriteArr')!=null && localStorage.getItem('FavoriteArr')!='')
			{
				//console.log(jQuery.parseJSON(localStorage.getItem('FavoriteArr')))
				var favorites = jQuery.parseJSON(localStorage.getItem('FavoriteArr'))
				//console.log(favorites)
				
				//favorites.blogHider=false;
			}
			else
			{
				favorites=[];
				//favorites.blogHider=true;
			}
			for(var x=0; x<favorites.length; x++)
				{
					//favorites[x].id=x;
					favorites[x].num_id=x;
				}
			localStorage.setItem('FavoriteArr', JSON.stringify(favorites));
			
			//return favorites;
			
		},
		checkFavorites: function(obj)
		{
			
			if(localStorage.getItem('FavoriteArr')!=null && localStorage.getItem('FavoriteArr')!='')
			{
				var favoritesArr = jQuery.parseJSON(localStorage.getItem('FavoriteArr'))
				
			}
			else
			{
				favoritesArr=[];
				//favorites.blogHider=true;
			}
			//console.log(favoritesArr)
			for(var x=0; x<favoritesArr.length; x++)
			{
				//favoritesArr[x].id=x;
				favoritesArr[x].favorite='off';
				
				if(favoritesArr[x].id==obj.id)
				{
					obj.favorite='on';
					
				}
				

			}
		}
		
	};
	
	

}]);

MusicWhereYouAreApp.factory('States', ['$http', '$routeParams', '$location', '$rootScope', '$sce',
function($http, $routeParams, $location, $rootScope, $sce) {
	return {
		createStateObj : function()
		{
			var usStates = [
		    { name: 'ALABAMA', abbreviation: 'AL', num:0, isThere:false},
		    { name: 'ALASKA', abbreviation: 'AK',  num:0, isThere:false},
		    { name: 'ARKANSAS', abbreviation: 'AR',  num:0, isThere:false},
		    { name: 'AMERICAN SAMOA', abbreviation: 'AS',  num:0, isThere:false},
		    { name: 'ARIZONA', abbreviation: 'AZ',  num:0, isThere:false},
		    { name: 'CALIFORNIA', abbreviation: 'CA',  num:0, isThere:false},
		    { name: 'COLORADO', abbreviation: 'CO',  num:0, isThere:false},
		    { name: 'CONNECTICUT', abbreviation: 'CT',  num:0, isThere:false},
		    { name: 'DISTRICT OF COLUMBIA', abbreviation: 'DC',  num:0, isThere:false},
		    { name: 'DELAWARE', abbreviation: 'DE',  num:0, isThere:false},
		    { name: 'FLORIDA', abbreviation: 'FL',  num:0, isThere:false},
		    { name: 'GEORGIA', abbreviation: 'GA',  num:0, isThere:false},
		    { name: 'GUAM', abbreviation: 'GU',  num:0, isThere:false},
		    { name: 'HAWAII', abbreviation: 'HI',  num:0, isThere:false},
		    { name: 'IOWA', abbreviation: 'IA', num:0, isThere:false},
		    { name: 'IDAHO', abbreviation: 'ID',  num:0, isThere:false},
		    { name: 'ILLINOIS', abbreviation: 'IL',  num:0, isThere:false},
		    { name: 'INDIANA', abbreviation: 'IN', num:0, isThere:false},
		    { name: 'KANSAS', abbreviation: 'KS',  num:0, isThere:false},
		    { name: 'KENTUCKY', abbreviation: 'KY',  num:0, isThere:false},
		    { name: 'LOUISIANA', abbreviation: 'LA',  num:0, isThere:false},
		    { name: 'MASSACHUSETTS', abbreviation: 'MA',  num:0, isThere:false},    
		    { name: 'MARYLAND', abbreviation: 'MD',  num:0, isThere:false},
		    { name: 'MAINE', abbreviation: 'ME', num:0, isThere:false},
		    { name: 'MICHIGAN', abbreviation: 'MI',  num:0, isThere:false},
		    { name: 'MINNESOTA', abbreviation: 'MN',  num:0, isThere:false},
		    { name: 'MISSOURI', abbreviation: 'MO',  num:0, isThere:false},
		    { name: 'MISSISSIPPI', abbreviation: 'MS',  num:0, isThere:false},
		    { name: 'MONTANA', abbreviation: 'MT',  num:0, isThere:false},
		     { name: 'NORTH CAROLINA', abbreviation: 'NC',  num:0, isThere:false},
		    { name: 'NORTH DAKOTA', abbreviation: 'ND',  num:0, isThere:false},
		    { name: 'NEBRASKA', abbreviation: 'NE',  num:0, isThere:false},
		    { name: 'NEW HAMPSHIRE', abbreviation: 'NH',  num:0, isThere:false},
			{ name: 'NEW JERSEY', abbreviation: 'NJ',  num:0, isThere:false},
		    { name: 'NEW MEXICO', abbreviation: 'NM',  num:0, isThere:false},
		    { name: 'NEVADA', abbreviation: 'NV',  num:0, isThere:false},
		    { name: 'NEW YORK', abbreviation: 'NY',  num:0, isThere:false},
		    { name: 'OHIO', abbreviation: 'OH',  num:0, isThere:false},
		    { name: 'OKLAHOMA', abbreviation: 'OK',  num:0, isThere:false},
		    { name: 'OREGON', abbreviation: 'OR',  num:0, isThere:false},
		    { name: 'PENNSYLVANIA', abbreviation: 'PA',  num:0, isThere:false},
		    { name: 'PUERTO RICO', abbreviation: 'PR',  num:0, isThere:false},
		    { name: 'RHODE ISLAND', abbreviation: 'RI', num:0, isThere:false},
		    { name: 'SOUTH CAROLINA', abbreviation: 'SC',  num:0, isThere:false},
		    { name: 'SOUTH DAKOTA', abbreviation: 'SD', num:0, isThere:false},
		    { name: 'TENNESSEE', abbreviation: 'TN',  num:0, isThere:false},
		    { name: 'TEXAS', abbreviation: 'TX',  num:0, isThere:false},
		    { name: 'UTAH', abbreviation: 'UT',  num:0, isThere:false},
		    { name: 'VIRGINIA', abbreviation: 'VA', num:0, isThere:false},
		    { name: 'VIRGIN ISLANDS', abbreviation: 'VI', num:0, isThere:false},
		    { name: 'VERMONT', abbreviation: 'VT',  num:0, isThere:false},
		    { name: 'WASHINGTON', abbreviation: 'WA',  num:0, isThere:false},
		    { name: 'WISCONSIN', abbreviation: 'WI',  num:0, isThere:false},
		    { name: 'WEST VIRGINIA', abbreviation: 'WV',  num:0, isThere:false},
		    { name: 'WYOMING', abbreviation: 'WY',  num:0, isThere:false },
		    { name: 'BREMUDA', abbreviation: 'BM',  num:0, isThere:false }
	];
				
		return usStates;
			
	},
	createCountriesObj:function()
	{
		return $http.get('json/countries.json').then(function(result)
		{
			return result;
		});
	}
};
}]);

MusicWhereYouAreApp.factory("HintShower", ['$q', '$rootScope', '$http', '$sce', '$location','States',
function($q, $rootScope, $http, $sce, $location, States) {
	var canceller = $q.defer();

	 return {
			
			showHint : function(location)
			{
				
			
			var states = States.createStateObj();
			
		 	
		 			
		 	var hints={};
		 	
		 	if(location.length==3)
			{
			var state_location = location[1]	
			if(location[1].length<3)
			{
				
				for(var x=0; x<states.length; x++ )				           
				{
					if(location[1].toUpperCase().match(states[x].abbreviation))
					{
					var state_location = states[x].name;
					
					}
				}
			}	
			return $http.get('https://www.googleapis.com/fusiontables/v1/query?sql=SELECT+Region,CityName,CountryID+FROM+1_7XFAaYei_-1QN5dIzQQB8eSam1CL0_0wYpr0W0G+WHERE+Region=%27'+state_location+'%27+AND+CityName=%27'+location[0]+'%27+AND+CountryID%=%27'+location[2]+'%27+ORDER%20BY+CityName&key=AIzaSyBBcCEirvYGEa2QoGas7w2uaWQweDF2pi0').then(function(result) {
				hints = result.data.rows;
				if(result.data.rows!=undefined)
				{
				hints.stateArr =[];
				hints.cityArr=[];
				hints.countryArr=[];
				hints.finalArr=[];
			 		
				for(var i=0; i<hints.length; i++)
				{
							
					hints.stateArr.push(hints[i][0]);
					hints.cityArr.push( hints[i][1]);
					hints.countryArr.push(hints[i][2]);
					
				}
				for (var t=0; t<hints.cityArr.length; t++)
				{
					hints.finalArr.push({city:hints.cityArr[t], cityhref:hints.cityArr[t].replace(/ /g, '_'), state: hints.stateArr[t], statehref:hints.stateArr[t].replace(/ /g, '_'), country: hints.countryArr[t], countryhref: hints.countryArr[t].replace(/ /g, '_')});
				}
				return hints;
				}
				});
		 	}
		 	if(location.length==2)
			{	
			var state_location = location[1];
				
			if(location[1].length<3)
			{

				for(var x=0; x<states.length; x++ )				           
				{
					if(location[1].toUpperCase().match(states[x].abbreviation))
					{
					var state_location = states[x].name;
					
					}
				}
			}	
				           
			return $http.get('https://www.googleapis.com/fusiontables/v1/query?sql=SELECT+Region,CityName,CountryID+FROM+1_7XFAaYei_-1QN5dIzQQB8eSam1CL0_0wYpr0W0G+WHERE+Region=%27'+state_location.toUpperCase()+'%27+AND+CityName=%27'+location[0].toUpperCase()+'%27+ORDER%20BY+CityName&key=AIzaSyBBcCEirvYGEa2QoGas7w2uaWQweDF2pi0').then(function(result) {
				if(result.data.rows!=undefined)
				{
					hints = result.data.rows;
					hints.stateArr =[];
					hints.cityArr=[];
					hints.countryArr=[];
					hints.finalArr=[];
				 	
					if(result.data.rows.length!=null)
					{
					for(var i=0; i<hints.length; i++)
					{
						
						hints.stateArr.push(hints[i][0]);
						hints.cityArr.push( hints[i][1]);
						hints.countryArr.push(hints[i][2]);
						
					}
					for (var t=0; t<hints.cityArr.length; t++)
					{
						hints.finalArr.push({city:hints.cityArr[t], cityhref:hints.cityArr[t].replace(/ /g, '_'), state: hints.stateArr[t], statehref:hints.stateArr[t].replace(/ /g, '_'), country: hints.countryArr[t], countryhref: hints.countryArr[t].replace(/ /g, '_')});
					}
					
					return hints;
					}
				}
				});
		 	}
		 	if(location.length==1)
			{	
					           
				
 
				//return $http.get('/php/geolocation.php?city='+location[0].toUpperCase(), { timeout: canceller.promise }).then(function(result) {
				return $http.get('https://www.googleapis.com/fusiontables/v1/query?sql=SELECT+Region,CityName,CountryID+FROM+1_7XFAaYei_-1QN5dIzQQB8eSam1CL0_0wYpr0W0G+WHERE+CityName=%27'+location[0].toUpperCase()+'%27+ORDER%20BY+CityName&key=AIzaSyBBcCEirvYGEa2QoGas7w2uaWQweDF2pi0').then(function(result) {
				
			 	if(result.data.rows!=undefined)
				{
					hints = result.data.rows;
					hints.stateArr =[];
					hints.cityArr=[];
					hints.countryArr=[];
					hints.finalArr=[];
					for(var i=0; i<hints.length; i++)
					{
						
						hints.stateArr.push(hints[i][0]);
						hints.cityArr.push( hints[i][1]);
						hints.countryArr.push(hints[i][2]);
						
					}
					for (var t=0; t<hints.cityArr.length; t++)
					{
						hints.finalArr.push({city:hints.cityArr[t], cityhref:hints.cityArr[t].replace(/ /g, '_'), state: hints.stateArr[t], statehref:hints.stateArr[t].replace(/ /g, '_'), country: hints.countryArr[t], countryhref: hints.countryArr[t].replace(/ /g, '_')});
					}
				
				return hints;
				}
				});
				 
				
				
				
				/*return $http.get('/php/geolocation.php?city='+location[0].toUpperCase()).then(function(result) {
				//return $http.get('https://www.googleapis.com/fusiontables/v1/query?sql=SELECT+Region,CityName,CountryID+FROM+1_7XFAaYei_-1QN5dIzQQB8eSam1CL0_0wYpr0W0G+WHERE+CityName=%27'+location[0].toUpperCase()+'%27+ORDER%20BY+CityName&key=AIzaSyBBcCEirvYGEa2QoGas7w2uaWQweDF2pi0').then(function(result) {
				//hints = result.data.rows;
				hints=result.data;
				hints.stateArr =[];
				hints.cityArr=[];
				hints.countryArr=[];
				hints.finalArr=[];
				for(var i=0; i<hints.length; i++)
				{
					
					//hints.stateArr.push(hints[i][0]);
					//hints.cityArr.push( hints[i][1]);
					//hints.countryArr.push(hints[i][2]);
					hints.stateArr.push(hints[i].Region);
					hints.cityArr.push( hints[i].City);
					hints.countryArr.push(hints[i].Country);
					
				}
				for (var t=0; t<hints.cityArr.length; t++)
				{
					hints.finalArr.push({city:hints.cityArr[t], cityhref:hints.cityArr[t].replace(/ /g, '_'), state: hints.stateArr[t], statehref:hints.stateArr[t].replace(/ /g, '_'), country: hints.countryArr[t], countryhref: hints.countryArr[t].replace(/ /g, '_')});
				}
				
				return hints;
				});*/
			}
		},	
			
				
			
		};
	
}]);	

MusicWhereYouAreApp.factory("Events", ['$q', '$rootScope', '$http', '$sce', '$location','States','$routeParams',
function($q, $rootScope, $http, $sce, $location, States, $routeParams) {
	return{
			getGeoEvents: function(lat, lng)
			{
				return $http.get('http://ws.audioscrobbler.com/2.0/?method=geo.getevents&lat='+lat +'&long='+lng+'&api_key=174019d04974adad421f3fb19681277e&limit=50&format=json&distance=41.5').then(function(results)
				{
					
					return results;
				});
			},
			
			getArtistEvents: function(artist)
			{
				return $http.get('http://ws.audioscrobbler.com/2.0/?method=artist.getevents&artist='+artist+'&api_key=174019d04974adad421f3fb19681277e&limit=25&format=json').then(function(results)
				{
					
					return results;
				});
			}
	};
}]);


MusicWhereYouAreApp.factory("ShareSongs", ['$q', '$rootScope', '$http', '$sce', '$location','States','$routeParams','retrieveLocation',
function($q, $rootScope, $http, $sce, $location, States, $routeParams, retrieveLocation) {
	return{
			
		getSongs: function(songs, location)
		{
		
		
			var deferred = $q.defer();	
			var str='';	
			
			for (var x=0; x<songs.length; x++)
			{
				str+=songs[x].name.replace(/&/g, 'and')+'{'+songs[x].id+'~'+songs[x].artists[0].name.replace(/&/g, 'and')+'}'+songs[x].favorite+']'+songs[x].artist_location.latitude+','+songs[x].artist_location.longitude+'**';
			}
			//str = encodeURI(str);
			var url = location.replace(/ /g, '_')+'/'+str.replace(/%20/g, '_').replace(/\//g, '--');
			url = '/playlist/'+url.replace(/ /g, '_').replace(/%20/g, '_').replace(/\//g, '--');
			deferred.resolve(url)
			return deferred.promise;
			
		},
		createSongsList: function()
		{
			var deferred = $q.defer();
			var songs_str = $routeParams.qs;
			var songs=[]
			var location_str = '';
			var tmpArr=songs_str.split('**');
			var tmpIdArr=[]
			var tmpTitleArr=[];
			var tmpFavArr=[];
			var tmpLat=[];
			var tmpLong=[];
			var tmpArtistsArr=[]
			songs.spot_arr=[];
			songs.savSpotArr=[];
			songs.songsArr=[];
			songs.spot_str='';
			songs.location_arr=[];
			songs.final_loc_arr=[];
			songs.spot_arr=[];
			songs.song_arr=[];
			//tmpArr=tmpArr.slice(1,21);
			
			//console.log(tmpArr);
			for(var x=0; x<tmpArr.length-1;x++)
			{
				tmpTitleArr.push(tmpArr[x].split('{')[0].replace(/_/g, ' '))
				tmpIdArr.push(tmpArr[x].split('{')[1].split('~')[0]);
				tmpArtistsArr.push(tmpArr[x].split('~')[1].split('}')[0].replace(/_/g, ' '));
				tmpFavArr.push(tmpArr[x].split('}')[1].split(']')[0]);
				tmpLat.push(parseFloat(tmpArr[x].split(']')[1].split(',')[0]));
				tmpLong.push(parseFloat(tmpArr[x].split(']')[1].split(',')[1]));
				songs.push({name:tmpTitleArr[x],tracks:{foreign_id:{spotify:{track:tmpIdArr[x]}}},favorite:tmpFavArr[x], artists:{0:{name:tmpArtistsArr[x]}},artist_location:{latitude: tmpLat[x], longitude: tmpLong[x], location:$location.path().split('/')[2].split('/')[0].replace('*', ', ').replace(/_/g, ' ')}});
				//tmpTitleArr[x]}{tracks:{foreign_id:{spotify:{track:tmpIdArr[x]}}}}
				songs.location_arr.push($location.path().split('/')[2].split('/')[0].replace('*', ', ')+'@@'+tmpLat[x] + ':' + tmpLong[x]+'&&<h5>'+tmpTitleArr[x]+'</h5><p>'+tmpArtistsArr[x]+'</p><a href="spotify:track:'+tmpIdArr[x]+'" ><div class="spot_link"  aria-hidden="true" data-icon="c" id="infobox_spot_link"+x></div></a><a><a a href="#/info/'+$location.path().split('/')[2].split('/')[0]+'/'+tmpArtistsArr[x].replace('The ', '')+'" ><div style="font-size:20px" class="spot_link information" id="infobox_info"+x  aria-hidden="true" data-icon="*"></div></a><div style="clear:both"></div>');
				songs.spot_str +=tmpIdArr[x]+',';
				songs.songsArr.push(songs[x]);
				songs.song_arr.push(tmpIdArr[x]);
				songs[x].id=tmpIdArr[x];
				songs.savSpotArr.push("spotify:track:"+tmpIdArr[x].id);
			}	
			songs.spot_strFinal = $sce.trustAsResourceUrl('https://embed.spotify.com/?uri=spotify:trackset:PREFEREDTITLE'+songs.spot_str);
				
				songs.location_arr.sort();
				
				for (var r=0; r<songs.location_arr.length; r++)
				{
					if(!location_str.match(songs.location_arr[r].split('@@')[0]))
					{
					songs.final_loc_arr.push('%%'+songs.location_arr[r]);
					location_str += songs.location_arr[r].split('@@')[0];
					}
					else
					{
						songs.final_loc_arr.push(songs.location_arr[r].split('@@')[1].split('&&')[1]);
					}
				}	
				
			
			/*return $http.get('http://cityblinking.com/scripps.php?q='+songs_str.replace(/_/g, '%20').replace(/--/g, '/').replace(/ /g, '_')).then(function(result){*/
				/*songs=result.data;
			
				songs.spot_arr=[];
				songs.savSpotArr=[];
				songs.songsArr=[];
				songs.spot_str='';
				songs.location_arr=[];
				songs.final_loc_arr=[];
				songs.spot_arr=[];
				songs.song_arr=[];
				for (var x=0; x<tmpArr.length-1; x++)
				{
				songs[x].tracks=[];
				songs[x].artist_location ={};
				songs[x].tracks.push({"foreign_id": "spotify:track:"+tmpArr.split('~')[0]})	
				
				/*songs[x].tracks=[];
				songs[x].artist_location = {}
				songs[x].artist_location={};
				songs[x].tracks.push({ "foreign_id": "spotify:track:"+songs[x].id});
				songs[x].id=songs[x].id;
				songs[x].name = songs[x].title.replace(/_/g, ' ').replace(/--/g, '/');
				songs[x].artists = {0:{name:songs[x].artist_name.replace(/_/g, ' ').replace(/--/g, '/')}};
				var favorite_loc_Arr = songs[x].favorite.split('(((');
				songs[x].favorite =songs[x].favorite[0];
				var loc_lat=songs[x].location.split(',')[0];
				var loc_lng= songs[x].location.split(',')[1];
				
				
				songs[x].artist_location.latitude=loc_lat;
				songs[x].artist_location.longitude=loc_lng;
				songs[x].artist_location.location=$location.path().split('/')[2].split('/')[0].replace('*', ' ');
				
				//songs.spot_arr.push('spotify:track'+songs[x].id);
				songs.location_arr.push(songs[x].artist_location.location.replace(/_/g, ' ') +'@@'+songs[x].artist_location.latitude + ':' + songs[x].artist_location.longitude+'&&<h5>'+songs[x].title+'</h5><p>'+songs[x].artist_name+'</p><a href="spotify:track:'+songs[x].id+'" ><div class="spot_link"  aria-hidden="true" data-icon="c" id="infobox_spot_link"+x></div></a><a><a a href="#/info/'+songs[x].location+'/'+songs[x].artist_name.replace('The ', '')+'" ><div style="font-size:20px" class="spot_link information" id="infobox_info"+x  aria-hidden="true" data-icon="*"></div></a><div style="clear:both"></div>');
				songs.spot_str +=songs[x].id+',';
				songs.songsArr.push(songs[x]);
				songs.song_arr.push(songs[x].id)
				songs.savSpotArr.push("spotify:track:"+songs[x].id);
				}
				songs.spot_str ='https://embed.spotify.com/?uri=spotify:trackset:PREFEREDTITLE:'+songs.spot_str;
				songs.spot_strFinal = $sce.trustAsResourceUrl(songs.spot_str);
				
				songs.location_arr.sort();
				
				for (var r=0; r<songs.location_arr.length; r++)
				{
					if(!location_str.match(songs.location_arr[r].split('@@')[0]))
					{
					songs.final_loc_arr.push('%%'+songs.location_arr[r]);
					location_str += songs.location_arr[r].split('@@')[0];
					}
					else
					{
						songs.final_loc_arr.push(songs.location_arr[r].split('@@')[1].split('&&')[1]);
					}
				}	
				*/
				deferred.resolve(songs);
				return deferred.promise;
			//});
			
		},
		
		getLongURL:function(url)
		{
			
			var deferred = $q.defer();
			if(url.length>2000)
			{
				
				var url= url.slice(0, 2000);
				var index =url.lastIndexOf('**');
				url = url.slice(0, index);
				var urlObj = {'url': 'http://musicwhereyour.com/%23'+url.replace('--', '/'), 'sliced':'yes'}
				
			}
			else{
			
			var url = (url);
			var urlObj = {'url': 'http://musicwhereyour.com/%23'+url.replace('--', '/'), 'sliced':'no'}
			}
			
			
			url ='http://cityblinking.com/MusicWhereYouAre/app/%23'+url.replace('--', '/');
			deferred.resolve(urlObj);
			return deferred.promise;
			
		},
		getBitLy:function(url)
		{
			var bitly = 'http://api.bitly.com/v3/shorten?format=json&apiKey=R_06ae3d8226a246f2a0bb68afe44c8379&login=robostheimer&longUrl='+url
			return $http.get(bitly).then(
				function(result){
					return result.data.data.url;
				});
		},	
	};
	


}]);	


MusicWhereYouAreApp.factory("Wiki", ['$q', '$rootScope', '$http', '$sce', '$location','States','$routeParams','Spotify','SongLength',
function($q, $rootScope, $http, $sce, $location, States, $routeParams, Spotify, SongLength) {
	return{
		getWikiLandmarks: function(lat,lng, country)
			{
				var country = '-'+country.toLowerCase();
				//var url='http://api.v3.factual.com/t/places-'+ $rootScope.longitudeObj_root.country.toLowerCase()+'?filters={%22category_ids%22:{%22$excludes_any%22:[2,347,308,432,123,384,385,405, 62,40, 235,414, 379, 23, 395,272,219,37,51,417,296,44,47,48,193,177,420,53,429, 375,377,378,380,381,382,383, 386,388,390,391,393,394,397,398,399,400,401,402,404,407,408,409,410,277]}}&include_count=true&limit=20&select=name&KEY=1ZlzUGTss1cocs7sHpIA6ypd3PJIsMs9Fwlth1Du&geo=%7B%22$circle%22:%7B%22$center%22:%5B'+lat+','+lng+'%5D,%22$meters%22:%2025000%7D%7D';		
				var url='http://api.v3.factual.com/t/places'+country+'?filters={%22category_ids%22:{%22$excludes_any%22:[2,347,308,432,123,384,385,405, 62,40, 235,414, 379, 23, 34, 221, 395,272,219,37,51,417,296,44,47,48,193,177,420,53,429, 375,377,378,380,381,382,383, 386,388,390,391,393,394,397,398,399,400,401,402,404,407,408,409,410,277]}}&include_count=true&limit=20&select=name&KEY=1ZlzUGTss1cocs7sHpIA6ypd3PJIsMs9Fwlth1Du&geo=%7B%22$circle%22:%7B%22$center%22:%5B'+lat+','+lng+'%5D,%22$meters%22:%2025000%7D%7D';
					
				
				return $http.get(url).then(function(results)
				{
					
					for(var x=0; x<results.data.response.data.length; x++)
					{
						results.data.response.data[x].number=5;
					}
					return results.data;
				});
			},
			
		lookUpTag: function(searchterm, number, qs, type) {
				$rootScope.loading_tags=true;
				var deferred = $q.defer();
				////////////////////Local Storage////////////////////////
				var ls_removeOut = jQuery.parseJSON(localStorage.getItem('leaveOutArr'));
				var ls_str=''
				var lsTitleArr = [];
				var lsIdArr=[];
				lsIdFavArr=[];
				if(ls_removeOut!=null)
				{
					for (var xx=0; xx<ls_removeOut.length; xx++)
					{
						lsTitleArr.push(ls_removeOut[xx].song);
						lsIdArr.push(ls_removeOut[xx].id);
					}

				}
				else
				{
					lsTitleArr=[];
					lsIdArr=[];
				}
				
				
				var ls_favorite = jQuery.parseJSON(localStorage.getItem('FavoriteArr'))
				if(ls_favorite!=null)
				{
					for (var yy=0; yy<ls_favorite.length; yy++)
					{
						lsIdFavArr.push(ls_favorite[yy].id);
					}
				}
				else
				{
					lsIdFavArr=[];
				}
				var obj ={arr:lsTitleArr, searchterm:searchterm.replace(/The /g, ''), number:number, qs:qs,type:type };
				deferred.resolve(obj)
				return deferred.promise;
				///////////////////////End Local Storage/////////////////////
		
			//	var searchterm = searchterm.replace(/The /g, '')
					
					Spotify.runSpotifySearch(searchterm, number,qs).then(function(result) {
							
							arr=[];
							
							var lengthy = result.length;
							if(lengthy>0)
							{
								for(var x=0; x<result.length; x++)
								{
									if (!$rootScope.titleArr.toString().replace(/\W/g, '').match(result[x].name.replace(/\W/g,''))&&!lsTitleArr.toString().match(result[x].name)) 
									{
									Spotify.lookUpEchonest(result[x]).then(function(result){
										
										result.keyword = searchterm;
										result.favorite ='off';
										result.num_id = $rootScope.holder.length;
										$rootScope.holder.push(result);
										arr.push(x)
										$rootScope.titleArr.push(result.name);
										
										if(lengthy==arr.length)
										{
										
										$rootScope.idStr = $sce.trustAsResourceUrl('https://embed.spotify.com/?uri=spotify:trackset:PREFEREDTITLE:' + $rootScope.idArr.toString());
											
											
											SongLength.checkSongLength($rootScope.count_about, 15);
											
										$rootScope.loading_tags=false;
										}
										});
									
									}
								
							}	//
						}
						else
						{
							$rootScope.loading_tags=false;
						}	
					
	});

			/*getWikiAttractions: function(location)
			{
				return $http.jsonp('http://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Visitor_attractions_in_'+location+'%E2%80%8E&cmtype=page&cmlimit=20&format=json&callback=JSON_CALLBACK').then(function(results)
				{
					//console.log(results.data.query.categorymembers)
					var attractions =results.data.query.categorymembers;
					for(var x=0; x<attractions.length; x++)
					{
						attractions[x].classy="off";
					}
					//console.log(attractions);
					return attractions;
				});
			},
			getWikiCulture: function(location)
			{
				return $http.jsonp('http://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Culture%20of%20'+location+'%E2%80%8E&cmtype=page&cmlimit=20&format=json&callback=JSON_CALLBACK').then(function(results)
				{
					//console.log(results.data.query.categorymembers)
					return results.data;
				});
			},*/
		}	
	};
}]);


MusicWhereYouAreApp.factory("Spotify",[ '$q', '$rootScope', '$http', '$sce','$routeParams','Favorites','MapCreate',
function($q, $rootScope, $http, $sce, $routeParams, Favorites, MapCreate){
	return{
		
		runLyricsnMusic: function(searchterm)
		{
			return $http.jsonp('http://api.lyricsnmusic.com/songs?api_key=548b2523656cf7b2bbf49252673c24&lyrics="'+searchterm+'"&callback=JSON_CALLBACK').then(function(result)
			{	
				
				var LnM_songs = result.data.data
				
				
				return LnM_songs;
			});
		},
		
		runSpotifySearch : function(searchterm, number, qs_noqs, arr)
		{
			
			if(localStorage.country!=undefined && localStorage.country!='')
			{
				if(qs_noqs=='yes')

				{
					
					var url = 'https://api.spotify.com/v1/search?q=title:"'+searchterm.split('[')[0]+'"%20year:1960-2014%20NOT%20genre:"Audiobooks,Spoken Word"&type=track&limit='+number+'&market='+localStorage.country.toUpperCase();
				}
				else {
					
					var url='https://api.spotify.com/v1/search?q=title:'+searchterm.split('[')[0]+'%20year:1960-2014%20NOT%20genre:"Audiobooks, Spoken Word"&type=track&limit='+number+'&market='+localStorage.country.toUpperCase()
				}
			}
			else{
				if(qs_noqs=='yes')
				{
				
				var url = 'https://api.spotify.com/v1/search?q=title:"'+searchterm.split('[')[0]+'"%20year:1960-2014%20NOT%20genre:"Audiobooks, Spoken Word"&type=track&limit='+number
				}
				else
				{
					var url = 'https://api.spotify.com/v1/search?q=title:'+searchterm.split('[')[0]+'%20year:1960-2014%20NOT%20genre:"Audiobooks, Spoken Word"&type=track&limit='+number
				}			
			}
			
			return $http.get(url).then(function(results)
			{
				
				var songs= results.data.tracks.items;
				songs.songsStr='';
				for(var z=0; z<songs.length; z++)
				{
					songs.songsStr+=songs[z].id;
					songs[z].searchterm = searchterm;
				}
				//console.log(songs)
				return songs;	
			});
		},
		checkSongMarket:function(songs)
		{
					var songsArr=[];
					var finalSongs=[];
					var songsArrStr='';
					for(var x=0; x<songs.length;x++)
					{
						songsArr.push(songs[x]);
						songsArrStr+=songs[x].tracks[0].foreign_id.split(':')[2]+',';
										
					}	
					songsArrStr=songsArrStr.slice(0, (songsArrStr.length-1));
					var url='https://api.spotify.com/v1/tracks/?ids='+songsArrStr;
					return $http.get(url).then(function(results){
					var tracks= results.data.tracks;
					
					
							
							for(var y=0; y<tracks.length; y++)
							{
								if(localStorage.country!=undefined && localStorage.country!="")
								{
								tracks[y].favorite='off';
								tracks[y].num_id=finalSongs.length;
								tracks[y].artist_location = songsArr[y].artist_location;
								if(tracks[y].available_markets.toString().match(localStorage.country))
								{
									finalSongs.push(tracks[y]);
									
								}
								
							}
							else{
							tracks[y].favorite='off';
							tracks[y].num_id=finalSongs.length;
							tracks[y].artist_location = songsArr[y].artist_location;
							finalSongs.push(tracks[y]);
							
							
							}
						}
						
							return finalSongs;	
					});
		
		},
		createPlaylist:function(songlist)
		{
			var deferred = $q.defer();
			
			
			var songs={};
			songs.songs=[];
			songs.spot_arr=[];
			songs.savSpotArr=[];
			songs.artistlocation ='';
			songs.spot_str='';
			songs.location_arr=[];
			for (var x = 0; x < songlist.length; x++) {
				songlist[x].artists[0].name=findThe(songlist[x].artists[0].name);
				songlist[x].num_id=x;
				songs.songs.push(songlist[x]);
				Favorites.checkFavorites(songlist[x]);
				songs.spot_arr.push(songlist[x].id);
				songs.savSpotArr.push('spotify:track:'+songlist[x].id);
				songs.artistlocation = $routeParams.location;

			songs.location_arr.push(songlist[x].artist_location.location + '@@' + songlist[x].artist_location.latitude + ':' + songlist[x].artist_location.longitude + '&&<h5>' + songlist[x].name + '</h5><p>' + songlist[x].artists[0].name + '</p><a href="spotify:track:' + songlist[x].id + '" ><div class="spot_link"  aria-hidden="true" data-icon="c" id="infobox_spot_link"+songs.length></div></a><a><a a href="#/info/' + songs.artistlocation + '/' + songlist[x].artists[0].name.replace('The ', '') + '" ><div style="font-size:20px" class="spot_link information" id="infobox_info"+songs.length  aria-hidden="true" data-icon="*"></div></a><div style="clear:both"></div>');
			
			}
			songs.location_arr.sort();
			songs.spot_str = 'https://embed.spotify.com/?uri=spotify:trackset:PREFEREDTITLE:' + songs.spot_arr.toString();
			songs.spot_strFinal = $sce.trustAsResourceUrl(songs.spot_str);
			console.log(songs)
			deferred.resolve(songs);
			return deferred.promise;
			
		},
		createLatLng:function(location_arr, counter, zoom, latitude, longitude, spot_arr)
		{
			//console.log(location_arr)
			location_arr.sort();
			var deferred = $q.defer();
			var location_str='';
			var final_loc_arr=[];
			
				for (var r = 0; r < location_arr.length; r++) {
				if(!location_str.match(location_arr[r].split('@@')[0]))
					{
					final_loc_arr.push('%%'+location_arr[r]);
					location_str +=location_arr[r].split('@@')[0];
					} else {
					final_loc_arr.push(location_arr[r].split('@@')[1].split('&&')[1]);
					
				}
				
				if (r == (location_arr.length - 1 )/*&& (data.data.response.songs.songsArr.length >= 5 || counter == 5)*/){
					
					MapCreate.runMap(zoom, latitude, longitude, final_loc_arr, spot_arr);
					$rootScope.mapOpening = false;
					$rootScope.loading=false;
					
				}
			}
			
		},
		
		
		lookUpEchonest:function(song)
		{
			var deferred =$q.defer();
			//console.log(song)
			if(song.artist_location==undefined)
			{
				var songtitle = song.name;
				var artist = removeSpecialChar(song.artists[0].name);
				
				return $http.get('http://developer.echonest.com/api/v4/song/search?api_key=3KFREGLKBDFLWSIEC&format=json&results=1&&artist='+artist+'&bucket=artist_location').then(function(data){
				if(data.data.response.songs.length==0)
				{
					song.artist_location={latitude:$rootScope.latitudeObj_root.latitude, longitude:$rootScope.longitudeObj_root.longitude, location:'No Location Data Available', location_link:''} ;
				}
				else if(jQuery.isEmptyObject(data.data.response.songs[0].artist_location)==true)
				{
				song.artist_location={latitude:$rootScope.latitudeObj_root.latitude, longitude:$rootScope.longitudeObj_root.longitude, location:'No Location Data Available', location_link:''} ;
				
				//return data.repsonse.songs[0].artist_location;
				//console.log(data.repsonse.songs[0].artist_location)
				}
				else{
					
					song.artist_location= data.data.response.songs[0].artist_location;
					song.artist_location.location_link=data.data.response.songs[0].artist_location.location.replace(/,/g, '*')
				}
				return song;
			});
			}
			else
			{
				song.artist_location.location_link= song.artist_location.location.replace(/,/g, '*')
				deferred.resolve(song)
				return deferred.promise;
				
			}
		},
		
		runRange:function(number)
		{
			
			if(number>15 )
			{
				zoom=2;
			}
			if(number>10&&number<15)
			{
				zoom=3;
			}
			
			if(number>7&&number<10)
			{
				zoom=4;
			}
			else if(number>5&&number<7)
			{
				zoom=5
			}
			else if(number>3&&number<5)
			{
				zoom=6
			}
			
			else if(number>2 &&number<3) 
			{
				zoom=7
			}
			else if(number>1&&number<2)
			{
				zoom=8
			}
			else if(number>.8&&number<1) 
			{
				zoom=9
			}
			else if(number>.6 && number<.8)
			{
				zoom=10
			}
			else if(number>.29 && number<.6)
			{
				zoom=11
			}
			else if(number>.2 &&number<.29)
			{
				zoom=12
			}
			else if(number>=0 &&number<.2) 
			{
				zoom=13
			}
			
			return zoom;
		}
		
	};
}]);	
//////////////////Need to lose the rootScopes and run in different service calls in the controller @ runSongAboutSearch in hashedLocation Controller
MusicWhereYouAreApp.factory("SongLength",[ '$q', '$rootScope', '$http', '$sce','Spotify','LocationDataFetch',
function($q, $rootScope, $http, $sce, Spotify, LocationDataFetch){
	return{
		checkSongLength:function(songs, number,iterator)
		{
			$rootScope.loading_tags=true;
			var location_arr = [];	
			var artistlocation = '';
			var artistlocations ={latitude:[], longitude:[]};
			var deferred = $q.defer();
			
			if(songs.length<iterator)
			{
				console.log('less')
				deferred.resolve(songs);
				return deferred.promise;
			}
			else
			{
				console.log('great');
				deferred.resolve(songs);
				return deferred.promise;
			}
			/*if(songs.length<iterator)
			{
				
				
				$rootScope.lookUpSongs=$rootScope.holder;
				
				for(var y=0; y<$rootScope.holder.length; y++)
				{
					//$rootScope.lookUpSongs.push($rootScope.holder[x]);
					$rootScope.idArr.push($rootScope.holder[y].id);
					$rootScope.savIdArr.push('spotify:track:'+$rootScope.holder[y].id);
					artistlocation =$rootScope.holder[y].artist_location.location;
					artistlocations.latitude.push($rootScope.holder[y].artist_location.latitude);	
					artistlocations.longitude.push($rootScope.holder[y].artist_location.longitude);
					artistlocations.latitude.sort();
					artistlocations.longitude.sort();
					
					
					location_arr.push($rootScope.holder[y].artist_location.location +'@@'+$rootScope.holder[y].artist_location.latitude + ':' + $rootScope.holder[y].artist_location.longitude+'&&<h5>'+$rootScope.holder[y].name+'</h5><p>'+$rootScope.holder[y].artists[0].name+'</p><a href="spotify:track:'+$rootScope.holder[y].id+'" ><div class="spot_link"  aria-hidden="true" data-icon="c" id="infobox_spot_link"+x></div></a><a><a a href="#/info/'+$rootScope.holder[y].artist_location.location.replace(', ' , '*').split(',')[0]+'/'+$rootScope.holder[y].artists[0].name.replace('The ', '')+'" ><div style="font-size:20px" class="spot_link information" id="infobox_info"+x  aria-hidden="true" data-icon="*"></div></a><div style="clear:both"></div>');
				
				}
	
				var lat_range =Math.abs(artistlocations.latitude[artistlocations.latitude.length-1]-artistlocations.latitude[0]);
				var lng_range = Math.abs(artistlocations.longitude[artistlocations.longitude.length-1]-artistlocations.longitude[0]);
				if(lat_range>lng_range)
				{
					var finalRange=lat_range					
				}
				else
				{
					var finalRange=lng_range;
				}
				var zoom=Spotify.runRange(finalRange)
							
				$rootScope.idStr = $sce.trustAsResourceUrl('https://embed.spotify.com/?uri=spotify:trackset:PREFEREDTITLE:' + $rootScope.idArr.toString());	
				$rootScope.loading_tags=false;
				///Spotify.createLatLng( location_arr,0, zoom,artistlocations.latitude[0], artistlocations.longitude[0], $rootScope.lookUpSongs);
				LocationDataFetch.count=100000000000;
			}
			else{
				
				$rootScope.moreLookUp = true;
				
					//$rootScope.lookUpSongs=$rootScope.holder;
					$rootScope.idArr=[];
					$rootScope.savIdArr=[];
					if($rootScope.lookUpSongs.length<=iterator)
					{
						for(var y=number; y<iterator; y++)
						{
						$rootScope.lookUpSongs.push($rootScope.holder[y]);
						$rootScope.idArr.push($rootScope.holder[y].id);
						$rootScope.savIdArr.push('spotify:track:'+$rootScope.holder[y].id);
						
						artistlocations.latitude.push($rootScope.holder[y].artist_location.latitude);	
						artistlocations.longitude.push($rootScope.holder[y].artist_location.longitude);
						artistlocations.latitude.sort();
						artistlocations.longitude.sort();
						location_arr.push($rootScope.holder[y].artist_location.location +'@@'+$rootScope.holder[y].artist_location.latitude + ':' + $rootScope.holder[y].artist_location.longitude+'&&<h5>'+$rootScope.holder[y].name+'</h5><p>'+$rootScope.holder[y].artists[0].name+'</p><a href="spotify:track:'+$rootScope.holder[y].id+'" ><div class="spot_link"  aria-hidden="true" data-icon="c" id="infobox_spot_link"+x></div></a><a><a a href="#/info/'+$rootScope.holder[y].artist_location.location.replace(', ' , '*').split(',')[0]+'/'+$rootScope.holder[y].artists[0].name.replace('The ', '')+'" ><div style="font-size:20px" class="spot_link information" id="infobox_info"+x  aria-hidden="true" data-icon="*"></div></a><div style="clear:both"></div>');
						
						
						}
						var lat_range =Math.abs(artistlocations.latitude[artistlocations.latitude.length-1]-artistlocations.latitude[0]);
						var lng_range = Math.abs(artistlocations.longitude[artistlocations.longitude.length-1]-artistlocations.longitude[0]);
						if(lat_range>lng_range)
						{
							var finalRange=lat_range					
						}
						else
						{
							var finalRange=lng_range;
						}
						var zoom=Spotify.runRange(finalRange)
									
						$rootScope.idStr = $sce.trustAsResourceUrl('https://embed.spotify.com/?uri=spotify:trackset:PREFEREDTITLE:' + $rootScope.idArr.toString());	
						//Spotify.createLatLng( location_arr,0, zoom,artistlocations.latitude[0], artistlocations.longitude[0], $rootScope.lookUpSongs);
						LocationDataFetch.count=100000000000;
						
					}
					else
					{
						$rootScope.lookUpSongs=[];
						$rootScope.idArr=[];
						$rootScope.savIdArr=[];
						for(var y=number; y<iterator; y++)
						{
						$rootScope.lookUpSongs.push($rootScope.holder[y]);
						$rootScope.idArr.push($rootScope.holder[y].id);
						$rootScope.savIdArr.push('spotify:track:'+$rootScope.holder[y].id);
						
						artistlocations.latitude.push($rootScope.holder[y].artist_location.latitude);	
						artistlocations.longitude.push($rootScope.holder[y].artist_location.longitude);
						artistlocations.latitude.sort();
						artistlocations.longitude.sort();
						location_arr.push($rootScope.holder[y].artist_location.location +'@@'+$rootScope.holder[y].artist_location.latitude + ':' + $rootScope.holder[y].artist_location.longitude+'&&<h5>'+$rootScope.holder[y].name+'</h5><p>'+$rootScope.holder[y].artists[0].name+'</p><a href="spotify:track:'+$rootScope.holder[y].id+'" ><div class="spot_link"  aria-hidden="true" data-icon="c" id="infobox_spot_link"+x></div></a><a><a a href="#/info/'+$rootScope.holder[y].artist_location.location.replace(', ' , '*').split(',')[0]+'/'+$rootScope.holder[y].artists[0].name.replace('The ', '')+'" ><div style="font-size:20px" class="spot_link information" id="infobox_info"+x  aria-hidden="true" data-icon="*"></div></a><div style="clear:both"></div>');
						
						}
							var lat_range =Math.abs(artistlocations.latitude[artistlocations.latitude.length-1]-artistlocations.latitude[0]);
							var lng_range = Math.abs(artistlocations.longitude[artistlocations.longitude.length-1]-artistlocations.longitude[0]);
							if(lat_range>lng_range)
							{
								var finalRange=lat_range					
							}
							else
							{
								var finalRange=lng_range;
							}
							var zoom=Spotify.runRange(finalRange)
										
							$rootScope.idStr = $sce.trustAsResourceUrl('https://embed.spotify.com/?uri=spotify:trackset:PREFEREDTITLE:' + $rootScope.idArr.toString());	
							
							LocationDataFetch.count=100000000000;
							if($rootScope.lookUpSongs.length>=iterator)
							{
								$rootScope.loading_tags=false;
								//Spotify.createLatLng( location_arr,0, zoom,artistlocations.latitude[0], artistlocations.longitude[0], $rootScope.lookUpSongs);
							}
					}
					
					$rootScope.idStr = $sce.trustAsResourceUrl('https://embed.spotify.com/?uri=spotify:trackset:PREFEREDTITLE:' + $rootScope.idArr.toString());
				
			}*/
		},
	};
}]);


MusicWhereYouAreApp.factory("Country",[ '$q', '$rootScope', '$http', '$sce', '$location', '$routeParams', 'PlaylistCreate', 'MapCreate', 'LocationDataFetch', 'getLocation', 'ShareSongs', 'retrieveLocation',
function($q, $rootScope, $http, $sce, $location, $routeParams, PlaylistCreate, MapCreate, LocationDataFetch, getLocation, ShareSongs, retrieveLocation){
	return{
		runPlaylist: function()
		{
			
		}
		
	};
}]);	



 	