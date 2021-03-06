import { Component, OnInit, ViewChild, ElementRef, NgZone, Input, Output, EventEmitter, Injectable } from '@angular/core';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { Location } from 'src/app/domens/location';
import {Parameters} from 'src/app/domens/params';
import {NgForm} from '@angular/forms';
import { PlaceDetails } from '../domens/placeDetails';
import { PlacesService } from '../services/places.service';
import { ParametersService } from '../services/parameters.service';
import { PlaceOnRoute } from '../domens/placeOnRoute';
import { WayType } from 'src/app/domens/way_type';

@Component({
  templateUrl: './wayParamsPage.html',
  styleUrls: ['./app.wayParamsPageComponent.scss']

})

@Injectable()
export class WayParamsPageComponent implements OnInit{

    @ViewChild('searchpl', {static: true})
    public searchElementRef: ElementRef;

    @ViewChild('startPoint', {static: true})
    public searchElementRefStart: ElementRef;

    @ViewChild('endPoint', {static: true})
    public searchElementRefEnd: ElementRef;

    wayPlaces:Array<Location> = new Array<Location>();
    start = false;
    end = false;

    @ViewChild('map', {static: false})
    mapElement: ElementRef;
  
    map: any;
    cityLocation: Array<Location> ;
    cityName: string;
    placeDetails: Array<PlaceDetails> = new Array<PlaceDetails>();
    locations: Array<Location> = new Array<Location>();
    types = ['park','tourist_attraction','aquarium'];
    favorites: Array<boolean> = new Array<boolean>();
    places = [];
    visibility: boolean = false;
    startPoint: Location;
    endPoint: Location;
    parameters: Parameters;
    way_options: Array<WayType>;
    route_places: Array<Location>;
    index = 0;

    geolocation;
    circle;
    options;
  
    constructor(
      private mapsAPILoader: MapsAPILoader,
      private mapsAPILoader2: MapsAPILoader,
      private placeService: PlacesService,
      private ngZone: NgZone,
      private parametersService: ParametersService
    )
    {}
  
    ngOnInit() {
      this.way_options = [
        {name: 'культурный', types: ['art_gallery','painter','library'],selected: false},
        {name: 'музеи', types: ['museum'],selected: false},
        {name: 'гастрономический гид', types: ['restaurant','cafe', 'bakery', 'food'],selected: false},
        {name: 'бары', types: ['bar','liquor_store'],selected: false},
        {name: 'активный отдых', types: ['amusement_park','bowling_alley','casino','night_club','movie_theater','establishment'],selected: false},
      ];

      this.cityLocation = JSON.parse(sessionStorage.getItem('cityAddressLocat'));
      this.cityName = sessionStorage.getItem('cityAddress');

      this.geolocation = {
        lat: this.cityLocation[0].lat,
        lng: this.cityLocation[0].lng
      };

      this.options = {
        types: ['establishment', 'geocode']
      };

      this.setAutocompliteToStartPoint();
      this.setAutocompliteToEndPoint();

      this.placeService.getAll().subscribe(data =>  this.places=data);
      this.loadPlaces();
      if(sessionStorage.getItem("LocatsToWay")){
        this.wayPlaces = JSON.parse(sessionStorage.getItem("LocatsToWay"));
      }
      console.log("Way" + JSON.stringify(this.wayPlaces));
      
      this.mapsAPILoader.load().then(() => {
        let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, this.options);
        this.circle = new google.maps.Circle(
          {center: this.geolocation, radius: 70000});
        autocomplete.setBounds(this.circle.getBounds());
        autocomplete.setOptions({strictBounds: true})
        autocomplete.addListener("place_changed", () => {
          this.ngZone.run(() => {
            let place:  google.maps.places.PlaceResult = autocomplete.getPlace();
              if (place.geometry === undefined || place.geometry === null) {
                return;
              }
              this.locations = [];
              this.locations= [{lat: place.geometry.location.lat(), lng: place.geometry.location.lng(),placeId: place.place_id}];
              sessionStorage.removeItem('locatsToShowOnMap');
              sessionStorage.setItem('locatsToShowOnMap', JSON.stringify(this.locations));
              sessionStorage.removeItem('detailsToShowOnMap');
              this.placeDetails = [];
              var photo = [];
              photo.push(place.photos[0].getUrl({maxWidth: 400}));
              this.placeDetails.push({name: place.name, address: place.formatted_address, photos: photo,
              types: place.types});
              sessionStorage.setItem('detailsToShowOnMap', JSON.stringify(this.placeDetails));
            });
        });
      })
    }
  
    loadPlaces(){
      this.placeDetails = [];
      this.locations = [];
      this.mapsAPILoader.load().then(() => {
        let city = {lat: this.cityLocation[0].lat, lng:  this.cityLocation[0].lng};
        let mapOptions = {
          center: city,
          zoom: 15
        }
  
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        let service = new google.maps.places.PlacesService(this.map);
        service.nearbySearch({
          location: city,
          radius: 70000,
          types: this.types
         
        }, (results, status) => {
            this.getPlaces(results, status)
        });
  
      }, (err) => {
        console.log(err);
      });
    }
  
    getPlaces(results, status){
      if (status === google.maps.places.PlacesServiceStatus.OK) {
          results.sort(function (a, b) {
            if (a['rating'] < b['rating']) {
              return 1;
            }
            if (a['rating'] > b['rating']) {
              return -1;
            }
            // a должно быть равным b
            return 0;
          });
  
          for (var i = 0; i < results.length ; i++) {
            var choose = false;
            var addedToWay = false;
            if(results[i].photos){
              CancelLoop: for(var j = 0; j<this.places.length; j++){

                if(results[i].place_id == this.places[j].placeId )
                {
                  choose = true;
                  break CancelLoop;
                }
              }
  
              CancelLoop2: for(var j = 0; j<this.wayPlaces.length; j++){
                if(results[i].place_id == this.wayPlaces[j].placeId )
                {
                  addedToWay = true;
                  break CancelLoop2;
                }
              }
              this.locations.push({lat: results[i].geometry.location.lat(), lng:  results[i].geometry.location.lng(),placeId: results[i].place_id , choose: choose, addedToWay: addedToWay});
              this.placeDetails.push({name: results[i].name, address: results[i].vicinity,photos: [results[i].photos[0].getUrl()],
                types: results[i].types, rating: results[i].rating});
                  
            }
          }
      }
    }
  
    sendPlaceId(index){
      sessionStorage.removeItem('landmark');
      sessionStorage.setItem("landmark", this.locations[index].placeId);
    }
  
    sendPopularLocations(){
      sessionStorage.removeItem('locatsToShowOnMap');
      sessionStorage.setItem('locatsToShowOnMap', JSON.stringify(this.locations));
      sessionStorage.removeItem('detailsToShowOnMap');
      sessionStorage.setItem('detailsToShowOnMap', JSON.stringify(this.placeDetails));
    }
  
    setIndex(index: number){
      if(index == 0){
        this.types = ['restaurant','cafe', 'bakery', 'food'];
      }
      if(index == 1){
        this.types = ['lodging'];
      }
      if(index == 2){
        this.types= ['bar','liquor_store'];
      }
      if(index == 3){
        this.types = ['amusement_park','bowling_alley','casino','night_club','movie_theater','establishment'];
      }
      if(index == 4){
        this.types = ['museum','art_gallery','painter','library'];
      }
      if(index == 5){
        this.types = ['clothing_store','shoe_store','shopping_mall'];
      }
      if(index == 6){
        this.types = ['park','tourist_attraction','aquarium'];
      }
    }
  
    toggle(){
      this.visibility=!this.visibility;
    }


    setAutocompliteToStartPoint(){
      this.mapsAPILoader2.load().then(() => {
        this.circle = new google.maps.Circle(
          {center: this.geolocation, radius: 70000});
        let autocomplete = new google.maps.places.Autocomplete(this.searchElementRefStart.nativeElement, this.options);
        autocomplete.setBounds(this.circle.getBounds());
        autocomplete.setOptions({strictBounds: true})
        autocomplete.addListener("place_changed", () => {
          this.ngZone.run(() => {
            let place: google.maps.places.PlaceResult = autocomplete.getPlace();

            if (place.geometry === undefined || place.geometry === null) {
              this.startPoint = null;
              this.start = false;
              return;
            }
              this.startPoint = {lat: place.geometry.location.lat(), lng: place.geometry.location.lng(), placeId: place.place_id};
              this.start = true;
          });
        });
      });
    
    }

    clearAddedPlaces(){
      var locs = new Array<Location>();
      this.locations.forEach(l => 
        {
          l.addedToWay = false;
          sessionStorage.setItem("LocatsToWay", JSON.stringify(locs));
          return 0;
        });
      sessionStorage.removeItem('locatsToShowOnMap');
      sessionStorage.setItem('locatsToShowOnMap', JSON.stringify(this.locations));
      console.log("way" + sessionStorage.getItem("LocatsToWay"));
    }

    setAutocompliteToEndPoint(){
      this.mapsAPILoader2.load().then(() => {
        this.circle = new google.maps.Circle(
          {center: this.geolocation, radius: 70000});
      
        let autocomplete = new google.maps.places.Autocomplete(this.searchElementRefEnd.nativeElement, this.options);
        
        autocomplete.setBounds(this.circle.getBounds());
        autocomplete.setOptions({strictBounds: true})
        autocomplete.addListener("place_changed", () => {
          this.ngZone.run(() => {
           let place: google.maps.places.PlaceResult = autocomplete.getPlace();
            if (place.geometry === undefined || place.geometry === null) {
              this.end = false;
              this.endPoint = null;
              return;
            }
            this.endPoint = {lat: place.geometry.location.lat(), lng: place.geometry.location.lng(),placeId: place.place_id};
            this.end = true;
          });
        });
       });
       
    }

    addToFavP(index){
      var loc = {lat: this.locations[index].lat, lng: this.locations[index].lng, placeId: this.locations[index].placeId};
      this.placeService.addPlace(loc).subscribe(data =>console.log(data));
      this.locations[index].choose = true;
      sessionStorage.removeItem('locatsToShowOnMap');
      sessionStorage.setItem('locatsToShowOnMap', JSON.stringify(this.locations));
    }
  
    deleteFromFavP(loc: Location, ind){
      var i;
      this.places.forEach(p => {
        if(p.placeId == loc.placeId)
          i = this.places.indexOf(p);
      });
  
      this.placeService.deleteById(this.places[i].placeId).subscribe(data =>console.log(data));
      this.places.splice(i, 1);
      this.locations[ind].choose = false;
  
      sessionStorage.removeItem('locatsToShowOnMap');
      sessionStorage.setItem('locatsToShowOnMap', JSON.stringify(this.locations));
      console.log("locations" + JSON.stringify(this.locations));
    }

    addToWay(i: number){
      var locs = [];
      if(JSON.parse(sessionStorage.getItem("LocatsToWay")) != null){
        locs = JSON.parse(sessionStorage.getItem("LocatsToWay"));
      }
      locs.push(this.locations[i]);
      sessionStorage.setItem("LocatsToWay", JSON.stringify(locs));
      this.locations[i].addedToWay = true;
      sessionStorage.removeItem('locatsToShowOnMap');
      sessionStorage.setItem('locatsToShowOnMap', JSON.stringify(this.locations));
      console.log("Way" + sessionStorage.getItem("LocatsToWay"));
    }
  
    deleteFromWay(j: number){
      var locs = new Array<Location>();
      locs = JSON.parse(sessionStorage.getItem("LocatsToWay"));
      console.log(locs);
      locs.forEach(l => 
        {
          if(l.placeId == this.locations[j].placeId)
          {
            var ind = locs.indexOf(l);
            console.log("index" + ind);
            locs.splice(ind, 1);
            sessionStorage.setItem("LocatsToWay", JSON.stringify(locs));
            console.log("Way" + sessionStorage.getItem("LocatsToWay"));
            return 0;
          }
        });
      this.locations[j].addedToWay = false;
      sessionStorage.removeItem('locatsToShowOnMap');
      sessionStorage.setItem('locatsToShowOnMap', JSON.stringify(this.locations));
      console.log("way" + locs);
    }

    loadPlacesForWay(types, placeCount, locats, form: NgForm){
      
      this.mapsAPILoader.load().then(() => {
        let city = {lat: this.cityLocation[0].lat, lng:  this.cityLocation[0].lng};
        let mapOptions = {
          center: city,
          zoom: 15
        }
  
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        let service = new google.maps.places.PlacesService(this.map);

        service.nearbySearch({
          location: city,
          radius: 70000,
          types: types
         
        }, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {

            for (let i = 0; i < placeCount; i++) {
                console.log(this.index);
                locats.push({lat: results[i].geometry.location.lat(), lng:  results[i].geometry.location.lng(),placeId: results[i].place_id , choose: false, addedToWay: false});
                locats[this.index]['rating'] = results[i]['rating'];
                this.index ++;
            }

            for(var t = 0; t < locats.length; t++)
            {
              for(var j = t + 1; j < locats.length; j++){
                if (locats[t].placeId == locats[j].placeId){
      
                  locats.splice(t, 1);
                  console.log("locats after filtering",locats);
                }
              }
            };

            var transportations = this.setTransportations(form)
            console.log("transport",transportations);

            locats.sort(function (a, b) {
              if (a['rating'] < b['rating']) {
                return 1;
              }
              if (a['rating'] > b['rating']) {
                return -1;
              }
              // a должно быть равным b
              return 0;
            });
            console.log("locats after sorting",locats);

            this.route_places = [];
            console.log(placeCount);
            for(var t = 0; t < placeCount; t++){
              this.route_places.push(locats[t]);
            }
            this.parameters = new Parameters(this.startPoint, this.endPoint, this.route_places, transportations);
            console.log("parameters" +  JSON.stringify(this.parameters));

            this.parametersService.sendParams(this.parameters).subscribe( data => 
              {
                sessionStorage.setItem("placesFromRoute", JSON.stringify(data));
                console.log("params" + sessionStorage.getItem("placesFromRoute"));
                window.location.replace("/mapRoutePage");
              }
            );
        }
        });
  
      }, (err) => {
        console.log(err);
      });
    }

    setPlacesToVisit(count: number, form: NgForm): Array<Location>{
      let locats = new Array<Location>();
      if(this.way_options[0].selected){
        this.loadPlacesForWay(this.way_options[0].types,count,locats, form);
      }
      if(this.way_options[1].selected){
        this.loadPlacesForWay(this.way_options[1].types,count,locats, form);
      }
      if(this.way_options[2].selected){
        this.loadPlacesForWay(this.way_options[2].types,count,locats, form);
      }
      if(this.way_options[3].selected){
        this.loadPlacesForWay(this.way_options[3].types,count,locats, form);
      }
      if(this.way_options[4].selected){
        this.loadPlacesForWay(this.way_options[4].types,count,locats, form);
      }
   
      return locats;
    }

    setTransportations(form: NgForm): Array<string>{
      var transportations = new Array<string>();

      if(form.controls['WALKING'].value)
      {
        transportations.push("walking");
      }
      if(form.controls['DRIVING'].value)
      {
        transportations.push("driving");
      }
      if(form.controls['TRANSIT'].value)
      {
        transportations.push("transit");
      }
      if(form.controls['BICYCLING'].value)
      {
        transportations.push("bicycling");
      }

      if(transportations.length == 0){
        transportations = ["walking"];
      }
      return transportations;
    }

    setParams(form: NgForm) { 
      
      let freeHours = form.controls['freeHours'].value;
      var transportations = this.setTransportations(form);
      let placesToVisit: number =  form.controls['placesToVisit'].value;
      let createWay: boolean = false;

      let locats = new Array<Location>();

      if(sessionStorage.getItem("LocatsToWay")){
        locats = JSON.parse(sessionStorage.getItem("LocatsToWay"));
        createWay = true;
      }


      if(locats.length == 0){
        createWay = false;
        this.index = 0;
        this.route_places = [];
        locats = this.setPlacesToVisit(placesToVisit, form);
      }

      if(createWay){
        this.parameters = new Parameters(this.startPoint, this.endPoint, locats, transportations);
        this.parametersService.sendParams(this.parameters).subscribe( data => 
          {
            sessionStorage.setItem("placesFromRoute", JSON.stringify(data));
            console.log("params" + sessionStorage.getItem("placesFromRoute"));
            window.location.replace("/mapRoutePage");
          } );
      }


      console.log(this.startPoint);
      console.log( this.endPoint);

      
    }
}
