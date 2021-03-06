$(function () {

    //var ipAddress = "http://192.168.125.215:3000";
    var ipAddress = "http://taxitrax.projectcodex.co";
    

    var backAction = null;

    function loginScreen(func){
    	$("body").load("pages/loginScreen.html", func);


    }
    function startUpScreen(func){

        $("body").load("pages/startUpScreen.html", func);
    }


    function showUsers(){
        //alert("show users");
        
        $.getJSON( ipAddress + "/users", function( users ) {
            $( "#contacts" ).html("");
            $.each(users, function(index, user){
                var details = "<a class=\"navigate-right\" id=\"" + user.id + "\" >" + user.firstName +" "+ user.lastName  + "</a>"
                $( "#contacts" ).append("<li class=\"table-view-cell\">" + details + "</li>");
            });
            clickUser();
        });

    }

    function clickUser(){

        $("#contacts").on("click", "li", function (evt) {
            

            //$("#home").click(function (){
            //});
                        
            userId = evt.target.id;
            showStartupScreen();
            //alert(userId);

        });
    }

    function showStartupScreen(){
        var tripId = null;
        $("body").load("pages/startUpScreen.html", function(){
                $("#start").click(function(){
                    $("body").load("pages/routes.html", function(){
                        loadRoutes(userId);
                    });
                });

                $("#overview").click(function(){
                    $("body").load("pages/overview.html", function(){
                        showOverviewEarnings(userId);
                    });
                });
                 $("#dailyOverview").click(function (){
                    $("body").load("pages/dailyEarnings.html", function(){
                        showDailyEarnings(userId);
                        $(".btn").click(function(){
                            $("body").load("pages/register.html", function ()
                                    {
                                       
                                    });
                        });
                    });

                });

                  $("#quit").click(function(){
                        navigator.app.exitApp();
                    })
                  ;
                backAction = function (){
                    loginScreen(showUsers);
                };

                $("#back").click(backAction);
               
            });
    }

    function loadRoutes(userId){
        $.getJSON(  ipAddress + "/routes/" + userId, function( routes ) {


                $("body").load("pages/routes.html", function(){
                    $("#home").click(function(){
                            showStartupScreen();
                        });
                    backAction = function (){
                    showStartupScreen();
                        };
                    $("#back").click(backAction);

                    $("#routes").html("");
                    $.each(routes, function(index, route){
                        var details = "<a class=\"navigate-right\" id=\"" + route.route_id + "\" >" + route.routeName +" "+ route.fare  + "</a>"
                          $( "#routes" ).append("<li class=\"table-view-cell\">" + details + "</li>");

                          $("#routes").on("click","li", function (routeEvt){
                                var routeId = routeEvt.target.id;   
                                //alert("routes : " + routeId);
                                
                                var route = null;
                                $.each(routes, function(index, theRoute){
                                    if(theRoute.route_id == routeId)
                                        route = theRoute;
                                });
                                loadStartTripScreen(userId, routeId, route);
                            });
                    });
                });
        });
    }

    function loadStartTripScreen(userId, routeId, route, capacity){

        $("body").load("pages/trips.html", function(){ 
         backAction = function (){
                    loadRoutes(userId);
                };
            $("#back").click(backAction);                          
            $("#capacity").bind("propertychange change click keyup input paste", function(){

                if($("#capacity").val() <= 0)
                {
                    $(".btn").attr("disabled", true);
                }
                else{
                    $(".btn").removeAttr("disabled");
                }
            });
            //

            $(".btn").click(function(){
                
                var capacity = parseInt($("#capacity").val());
                $.post( ipAddress + "/trips/start", 
                {   ownerId : userId, 
                    routeId : routeId, 
                    capacity : capacity },
                function(createdTrip) {
                    tripId = createdTrip.trip_id;
                }).fail(function(err){
                    alert(JSON.stringify(err));
                });

                 $("body").load("pages/tripEnd.html", function(){ 

                        var totalFare  = "<a class=\"table-view-cell\" id=\"" + " "+ "\" >" + " Total Fare Per Trip "+"</a>";
                        var passengers = "<a class=\"table-view-cell\" id=\"" + " "+ "\" >" + " Passengers " + " " +"</a>";
                        var routesIdentity = "<a class=\"table-view-cell\" id=\"" + " "+ "\" >" + " Route "  +"</a>";
                        $("#tripEnd").append("<li class=\"table-view-cell\">" + passengers + "<span class=\"badge\">" + capacity +"</span></li>");
                        $("#tripEnd").append("<li class=\"table-view-cell\">" + totalFare + "<span class=\"badge\">" + "R"+route.fare*capacity +"</span></li>");
                        $("#tripEnd").append("<li class=\"table-view-cell\">" + routesIdentity+ "<span class=\"badge\">" + routeId +"</span></li>");
                        
                        $(".btn").click(function ()
                            {

                                $.post( ipAddress + "/trips/end",
                                {   
                                    ownerId : userId, 
                                    routeId : routeId, 
                                    capacity : capacity,
                                    tripId : tripId 

                                }, function(trips) {
                                        tripId = trips.trip_id;
                                        showDailyEarnings(userId);
                                    })
                                .fail(function(err){
                                    alert(JSON.stringify(err));
                                });       
                        });
                    });
                });
            });
        }

    function loadOverview(){

    }

    function showDailyEarnings(userId){
        $("body").load("pages/dailyEarnings.html", function(){
        
            $.getJSON(  ipAddress + "/trips/today/" + userId, function( trips ) {
                //
                var  totalFare = 0;    
                $.each(trips, function(index, trip){
                    var routesIdentity = "<a class=\"table-view-cell\" id=\"" +  trip.routeID  + "\" >" + trip.routeName + "</a>";
                    $("#earnings").append("<li class=\"table-view-cell\">" + routesIdentity+ "<span class=\"badge\">R" + trip.totalFare + "</span></li>");
                    totalFare += trip.totalFare;        
                });

                $("#totalFare").text("R" + totalFare + ".00");
            });
                 backAction = function (){
                    showStartupScreen();
                };
            $("#back").click(backAction);
       });
    };

    function showOverviewEarnings(userId){
        $("body").load("pages/overview.html", function(){ 
                                             
            $.getJSON(  ipAddress + "/trips/all/" + userId, function( trips ) {
                var  totalFare = 0;   
                $.each(trips, function(index, trip){
                    var routesIdentity = "<a class=\"table-view-cell\" id=\"" +  trip.routeID  + "\" >" + trip.routeName + "</a>";
                    $("#overview").append("<li class=\"table-view-cell\">" + routesIdentity+ "<span class=\"badge\">R" + trip.totalFare + "</span></li>");
                    totalFare += trip.totalFare;
                });
                 $("#allTotalFare").text("R" + totalFare + ".00");
            });

            backAction = function (){
                    showStartupScreen();
                };
            $("#back").click(backAction);
       });
    };



    loginScreen(showUsers);
    
    document.addEventListener("backbutton", function(){
        backAction();
    });


});