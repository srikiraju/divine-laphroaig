PlayerState = new Mongo.Collection("playerStateCollection")
GameState = new Mongo.Collection("gameState")


// =====> Rock/Paper/Scissors selection
if (Meteor.isClient) {

  // Routing logic
  Router.map(function() {
    this.route("/", {
      template: "home"
    });

    function routeForPlayer(playerID) {
      return function() {
        console.log("Deciding what to render for player: " + playerID)
        this.subscribe('playerStateCollection', playerID).wait()
        this.subscribe('gameState', playerID).wait()

        if (this.ready()) {
          var gameState = GameState.findOne({
            "_id": playerID
          })
          console.log(gameState)
          this.render(gameState.state, {
            data: {
              playerID: playerID,
              winnerResults: gameState.winner
            }
          })
        } else {
          this.render("loading")
        }
      }
    }

    this.route("/player1", routeForPlayer("1"))
    this.route("/player2", routeForPlayer("2"))
  })

  Template.rockpaperscissors.events({
    'click #rock': function() {
      Meteor.call("playRoutine", this.playerID, "rock")
    },
    'click #paper': function() {
      Meteor.call("playRoutine", this.playerID, "paper")
    },
    'click #scissors': function() {
      Meteor.call("playRoutine", this.playerID, "scissors")
    }
  })

  Template.results.events({
    "click #restart": function() {
      Meteor.call("resetState")
    }
  })
}


if (Meteor.isServer) {
  Meteor.startup(function() {
    // Force update on restart
    resetState()
  })

  Meteor.publish("playerStateCollection", function(playerID) {
    return PlayerState.find({
      _id: playerID
    })
  })
  Meteor.publish("gameState", function(playerID) {
    return GameState.find({
      _id: playerID
    })
  })
}

// Convert player states to respective visible game states
function updateGameState() {
  var player1State = PlayerState.findOne({
    "_id": "1"
  })
  var player2State = PlayerState.findOne({
    "_id": "2"
  })

  /// XXX: Factor
  if (player1State === undefined && player2State === undefined) {
    setBothPlayersGameState("rockpaperscissors")
  } else if (player1State === undefined) {
    // Player 2 is waiting
    GameState.update({
      _id: "2"
    }, {
      state: "waiting"
    })
  } else if (player2State === undefined) {
    // Player 1 is waiting
    GameState.update({
      _id: "1"
    }, {
      state: "waiting"
    })
  } else {
    var p1 = player1State.selected
    var p2 = player2State.selected
    var player1Wins = "Player 1 wins!"
    var player2Wins = "Player 2 wins!"
    var result = ""

    // XXX: Maybe support "You are a winner" or some such
    if (p1 == p2) {
      result = "Tie! Both players chose " + p1
    }

    switch (p1) {
      case "rock":
        switch (p2) {
          case "paper":
            result = player2Wins
          case "scissors":
            result = player1Wins
        }
        break
      case "paper":
        switch (p2) {
          case "rock":
            result = player1Wins
          case "scissors":
            result = player2Wins
        }
      case "scissors":
        switch (p2) {
          case "rock":
            result = player1Wins
          case "paper":
            result = player2Wins
        }
    }

    setBothPlayersGameState("results", result)
  }
}

function setBothPlayersGameState(state, winner) {
  GameState.update({
    "_id": "1"
  }, {
    winner: winner,
    state: state
  }, {
    upsert: true
  })
  GameState.update({
    "_id": "2"
  }, {
    winner: winner,
    state: state
  }, {
    upsert: true
  })
}

function resetState() {
  PlayerState.remove({
    "_id": "1"
  })
  PlayerState.remove({
    "_id": "2"
  })
  setBothPlayersGameState("rockpaperscissors")
}

Meteor.methods({
  playRoutine: function(playerID, played) {
    PlayerState.insert({
      "_id": playerID,
      selected: played
    })
    updateGameState()
  },

  resetState: function() {
    resetState()
  }
})
