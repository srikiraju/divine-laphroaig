PlayerState = new Mongo.Collection("playerStateCollection")

// Routing logic
Router.map(function() {
  this.route("/", {
    template: "home"
  });

  function routeForPlayer(playerID) {
    return function() {
      console.log("Deciding what to render for player: " + playerID)
        // Two queries to determine what to do
      var player1State = PlayerState.findOne({
        _id: "1"
      })
      var player2State = PlayerState.findOne({
        _id: "2"
      })
      console.log("P1: " + player1State)
      console.log("P2: " + player2State)
      var renderArg = {
        data: {
          playerID: playerID
        }
      }

      if (player1State && player2State) {
        console.log("Routing to results")
        this.render("results", {
          data: {
            playerID: playerID,
            player1State: player1State,
            player2State: player2State
          }
        })
      } else if (player1State && playerID == "1") {
        console.log("Player1 is waiting")
        this.render("waiting", renderArg)
      } else if (player2State && playerID == "2") {
        console.log("Player2 is waiting")
        this.render("waiting", renderArg)
      } else {
        this.render("rockpaperscissors", renderArg)
      }
    }
  }

  this.route("/player1", routeForPlayer("1"))
  this.route("/player2", routeForPlayer("2"))
})

if (Meteor.isClient) {

  // =====> Rock/Paper/Scissors selection
  Template.rockpaperscissors.helpers({
    counter: function() {
      return Session.get('counter');
    }
  });

  Template.rockpaperscissors.events({
    'click #rock': function() {
      console.log(this.playerID + "Clicked rock")
      PlayerState.insert({
        _id: this.playerID,
        selected: "rock"
      })
    },
    'click #paper': function() {
      PlayerState.insert({
        _id: this.playerID,
        selected: "paper"
      })
    },
    'click #scissors': function() {
      PlayerState.insert({
        _id: this.playerID,
        selected: "scissors"
      })
    }
  });

  // =====> Waiting for player

  // =====> Results display
  Template.results.helpers({
    winnerResults: function() {
      console.log("Winner helper")
      var w = decideWinner(this.player1State.selected, this.player2State.selected)
      console.log(w)
      return w
    }
  })
  Template.results.events({
    "click #restart" : function() {
      PlayerState.remove({"_id" : "1"})
      PlayerState.remove({"_id" : "2"})
    }
  })
}

// Assumes p1, p2 are either "rock", "paper" or "scissors"
function decideWinner(p1, p2) {
  if (p1 == p2) {
    return "Tie! Both players chose " + p1
  }

  switch (p1) {
    case "rock":
      switch (p2) {
        case "paper":
          return "Player 2"
        case "scissors":
          return "Player 1"
      }
      break
    case "paper":
      switch (p2) {
        case "rock":
          return "Player 1"
        case "scissors":
          return "Player 2"
      }
    case "scissors":
      switch (p2) {
        case "rock":
          return "Player 2"
        case "paper":
          return "Player 1"
      }
  }
  throw "Unhandled case in decideWinner: " + p1 + "," + p2
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    // code to run on server at startup
  });
}
