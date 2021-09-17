class UI {
  getUIComponents() {
    const comps = {
      PlayGround: document.getElementById("playGround"),
      PlayerOneChar: document.getElementById("p1char"),
      PlayerTwoChar: document.getElementById("p2char"),
      playerOneInput: document.getElementById("player1"),
      playerTwoInput: document.getElementById("player2"),
      playerOnePowerMeter: document.getElementById("p1_Power"),
      playerTwoPowerMeter: document.getElementById("p2_Power"),
      playerOneHealth: document.getElementById("p1_health"),
      playerTwoHealth: document.getElementById("p2_health"),
      Rounds: document.getElementById("round"),
      scoreBoard: document.getElementById("score"),
      flashBoaard: document.getElementById("flashBoard"),
      restart: document.getElementById("restart"),
    };
    return {
      playground: comps.PlayGround,
      player_1: comps.PlayerOneChar,
      player_2: comps.PlayerTwoChar,
      player1_Input: comps.playerOneInput,
      player2_Input: comps.playerTwoInput,
      player1_Health: comps.playerOneHealth,
      player2_Health: comps.playerTwoHealth,
      p1_PowerMeter: comps.playerOnePowerMeter,
      p2_PowerMeter: comps.playerTwoPowerMeter,
      rounds: comps.Rounds,
      scores: comps.scoreBoard,
      leaderBoard: comps.flashBoaard,
      startAgain: comps.restart,
    };
  }

  updateUI(P1, P2) {
    this.getUIComponents().player1_Health.innerHTML = `${P1.playerName}'s Health:${P1.health}`;
    this.getUIComponents().player2_Health.innerHTML = `${P2.playerName}'s Health:${P2.health}`;
    this.getUIComponents().scores.innerHTML = `Score:${P1.score}-${P2.score}`;
  }
  cleanUI() {
    let i = this.getUIComponents().playground.children.length - 1;
    while (i >= 0) {
      let j = this.getUIComponents().playground.children[i].children.length - 1;
      while (j >= 0) {
        this.getUIComponents().playground.children[i].children[j].remove();
        j--;
      }
      i--;
    }
  }
}

class Player {
  constructor(name, char) {
    (this.playerName = name),
      (this.health = 100),
      (this.power = 0),
      (this.score = 0),
      (this.playerChar = char),
      (this.ui = new UI());
  }

  fire() {
    let fireball = document.createElement("span");
    fireball.classList.add("fire");
    if (this.playerChar === this.ui.getUIComponents().player_1) {
      fireball.style = `animation: fire1 1s forwards ease-in-out`;
    } else if (this.playerChar === this.ui.getUIComponents().player_2) {
      fireball.style = `animation: fire2 1s forwards ease-in-out`;
    }
    this.playerChar.appendChild(fireball);
  }

  moves(move) {
    //ground size
    const groundSize = this.ui.getUIComponents().playground.clientHeight;
    //character size
    const charSize = this.playerChar.getClientRects()[0].height;
    // current position
    const currentPos = this.playerChar.offsetTop;

    // current position + character size
    //const steps = currentPos + charSize;
    const steps =(groundSize / charSize);

    if (move === "down") {
      if (
        currentPos < groundSize - charSize &&
        groundSize - (currentPos + charSize) >= groundSize / charSize
      ) {
        this.playerChar.style = `margin-top:${currentPos+steps}px`;
      }
    } else if (move === "up") {
      // current position - character size
      //const steps = currentPos - charSize;
      if (currentPos > 0) {
        this.playerChar.style = `margin-top:${currentPos-steps}px`;
      }
    }
  }

  playerHealth(oponent, callback) {
    //instead 20 use : this.power;
    const lastShootFireball = this.playerChar.lastElementChild;
    // start position
    const opoPos = oponent.playerChar.offsetTop;
    //char height with borders
    const opoheight = oponent.playerChar.getClientRects()[0].height;
    //char height without borders
    // const opoheight = oponent.playerChar.clientHeight;
    let OponentHitRange = {
      from: opoPos,
      to: opoPos + opoheight,
    };
    lastShootFireball.addEventListener("animationend", (e) => {
      let fireballRange = e.target.offsetTop;
      //  console.log(OponentHitRange, fireballRange);
      if (
        fireballRange >= OponentHitRange.from &&
        fireballRange <= OponentHitRange.to
      ) {
        // console.log("hit");
        if (oponent.health - this.power < 0) {
          oponent.health = 0;
        } else oponent.health -= this.power;
      } else {
        //  console.log("miss");
      }
      callback();
    });
  }
}

class Match {
  constructor(Player1, Player2) {
    this.p1 = Player1;
    this.p2 = Player2;
    this.rounds = 1;
    this.ready = true;
    this.gameOver = false;
    this.playersScore = { p1: 0, p2: 0 };
    this.ui = new UI();
  }

  start = () => {
    this.ui.getUIComponents().rounds.innerHTML = `ROUND:${this.rounds}`;
    this.ui.updateUI(this.p1, this.p2);

    document.body.addEventListener("keyup", (e) => {
      this.ui.updateUI(this.p1, this.p2);
      // no of rounds check default 5
      if (this.rounds <= 5 && this.ready && !this.gameOver) {
        this.ui.getUIComponents().rounds.innerHTML = `ROUND:${this.rounds}`;

        //if there is no health
        if (this.p1.health <= 0 || this.p2.health <= 0) {
          this.ready = false;
          let winner = {};
          if (this.p1.health > this.p2.health) {
            this.playersScore.p1++;
            winner = this.p1;
          } else {
            this.playersScore.p2++;
            winner = this.p2;
          }
          this.p1.score = this.playersScore.p1;
          this.p2.score = this.playersScore.p2;

          if (this.p1.score >= 3 || this.p2.score >= 3) {
            this.gameOver = true;
            this.finish();
          } else {
            this.flashBoaard(false, winner);
          }
        } else {
          //fire if health remains
          const action = e.key.toLowerCase();
          if (action === "q" || action === "z" || action === "c") {
            if (action === "q") {
              this.p1.moves("up");
            } else if (action === "z") {
              this.p1.moves("down");
            } else if (action === "c") {
              this.p1.power = this.ui.getUIComponents().p1_PowerMeter.value;
              this.p1.fire();
              this.p1.playerHealth(this.p2, () => {
                this.ui.updateUI(this.p1, this.p2);
              });
            }
          } else if (action === "9" || action === "3" || action === "1") {
            if (action === "9") {
              this.p2.moves("up");
            } else if (action === "3") {
              this.p2.moves("down");
            } else if (action === "1") {
              this.p2.power = this.ui.getUIComponents().p2_PowerMeter.value;
              this.p2.fire();
              this.p2.playerHealth(this.p1, () => {
                this.ui.updateUI(this.p1, this.p2);
              });
            }
          }
        }
      } else if (this.rounds > 5 && this.ready && !this.gameOver) {
        this.gameOver = true;
        this.finish();
      }
    });
  };

  flashBoaard(seriesOver = false, winner) {
    let x = new UI().getUIComponents().leaderBoard;
    x.children[0].innerHTML = `Round: ${this.rounds}`;
    x.children[1].innerHTML = `${winner.playerName} Wins`;
    x.children[2].innerHTML = `Score: ${this.p1.score}-${this.p2.score}`;

    this.ui.getUIComponents().leaderBoard.style.display = "flex";
    if (!seriesOver) {
      setTimeout(() => {
        this.ui.getUIComponents().leaderBoard.style.display = "none";
        this.UpdateNextRound();
      }, 3000);
    } else {
      let msg = document.createElement("p");
      msg.appendChild(
        document.createTextNode(`GameOver ${winner.playerName} Won the series`)
      );
      x.insertBefore(msg, x.children[0]);
      this.ui.getUIComponents().startAgain.style.display = "block";
      this.ui.getUIComponents().startAgain.addEventListener("click", () => {
        location.reload();
      });
    }
    this.ui.cleanUI();
  }

  UpdateNextRound = () => {
    this.p1.health = 100;
    this.p2.health = 100;
    this.ui.cleanUI();
    this.rounds++;
    this.ui.updateUI(this.p1, this.p2);
    this.ready = true;
  };

  finish = () => {
    if (this.gameOver) {
      if (this.p1.score > this.p2.score) {
        this.flashBoaard(true, this.p1);
      } else this.flashBoaard(true, this.p2);
    }
  };
}




document.getElementById("start").addEventListener("click", (e) => {
  e.preventDefault();
  // PlayGround.style.display='block';
  const ui = new UI();

  // input players name
  const p1 = ui.getUIComponents().player1_Input.value;
  const p2 = ui.getUIComponents().player2_Input.value;

  //getting player characters
  const p1_character = ui.getUIComponents().player_1;
  const p2_character = ui.getUIComponents().player_2;

  //creating players
  const player1 = new Player((p1).toUpperCase()  , p1_character);
  const player2 = new Player((p2).toUpperCase(), p2_character);

  //starting match
  const match = new Match(player1, player2);
  match.start();
});
