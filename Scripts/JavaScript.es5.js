"use strict";

function Team(name, writeName) {
    this.name = name;
    this.writeName = writeName;
    this.bonusRemainingTime = 80;
    this.pick = 1;
}

function PhaseType(type, time) {
    this.type = type;
    this.time = time;
}

var PHASE_TYPE = {
    BAN: { time: 25 },
    PICK: { time: 35 }
};

function Phase(type, team) {
    this.type = type;
    this.team = team;
}

function CaptainsPick(legion, hellbourne) {
    var instance = this;
    this.legion = legion;
    this.hellbourne = hellbourne;
    this.currentTime = 0;
    this.phaseIndex = -1;

    this.phases = [new Phase(PHASE_TYPE.BAN, legion), new Phase(PHASE_TYPE.BAN, hellbourne), new Phase(PHASE_TYPE.BAN, legion), new Phase(PHASE_TYPE.BAN, hellbourne), new Phase(PHASE_TYPE.BAN, legion), new Phase(PHASE_TYPE.BAN, hellbourne), new Phase(PHASE_TYPE.PICK, legion), new Phase(PHASE_TYPE.PICK, hellbourne), new Phase(PHASE_TYPE.PICK, hellbourne), new Phase(PHASE_TYPE.PICK, legion), new Phase(PHASE_TYPE.PICK, legion), new Phase(PHASE_TYPE.BAN, hellbourne), new Phase(PHASE_TYPE.BAN, legion), new Phase(PHASE_TYPE.BAN, hellbourne), new Phase(PHASE_TYPE.BAN, legion), new Phase(PHASE_TYPE.BAN, hellbourne), new Phase(PHASE_TYPE.BAN, legion), new Phase(PHASE_TYPE.PICK, hellbourne), new Phase(PHASE_TYPE.PICK, hellbourne), new Phase(PHASE_TYPE.PICK, legion), new Phase(PHASE_TYPE.PICK, legion), new Phase(PHASE_TYPE.PICK, hellbourne)];

    this.nextPhase = function () {
        instance.phaseIndex++;
        if (!instance.isEnd()) {
            var phase = this.currentPhase();
            this.currentTime = phase.type.time;
            var alert = "<span class='" + phase.team.name + "'>" + phase.team.writeName + "</span>";
            alert += " is now ";
            alert += phase.type == PHASE_TYPE.BAN ? "<span class='red'>banning</span>" : "<span class='green'>picking</span>";
            instance.writeAlert(alert);
            instance.update();
        }
    };

    this.isEnd = function () {
        return !(instance.phaseIndex >= 0 && instance.phaseIndex < instance.phases.length) || instance.currentTime <= 0 && instance.currentPhase().team.bonusRemainingTime <= 0;
    };

    this.currentPhase = function () {
        return instance.phases[instance.phaseIndex];
    };

    this.update = function () {
        if (instance.currentTime <= 0 && instance.currentPhase().team.bonusRemainingTime <= 0) instance.writeAlert(instance.currentPhase().team.writeName + " ran out of time!");

        $("#currentTime").text(Math.floor(this.currentTime / 60) + ':' + this.currentTime % 60);
        $("#legionTime").text(this.legion.bonusRemainingTime);
        $("#hellbourneTime").text(this.hellbourne.bonusRemainingTime);
    };

    this.tick = function () {
        if (!instance.isEnd()) {
            if (instance.currentTime > 0) instance.currentTime--;else {
                if (instance.currentPhase().team.bonusRemainingTime > 0) instance.currentPhase().team.bonusRemainingTime--;else {
                    instance.stop();
                }
            }
            instance.update();
        }
    };

    this.init = function () {
        this.nextPhase();
    };

    this.start = function () {
        if (!instance.intervalHandle) this.intervalHandle = setInterval(this.tick, 1000);
    };

    this.stop = function () {
        if (instance.intervalHandle) clearInterval(instance.intervalHandle);
    };

    this.heroClicked = function (hero) {
        if (!instance.isEnd() && !$(hero).hasClass("banned") && !$(hero).hasClass("picked") && !$(hero).hasClass("not-selectable")) {
            var name = instance.currentPhase().team.name;
            var writeName = instance.currentPhase().team.writeName;
            if (instance.currentPhase().type == PHASE_TYPE.BAN) {
                $(hero).addClass("banned");
                instance.writeMessage("<span class='" + name + "'>" + writeName + "</span> <b class='red'>banned</b>" + " " + $(hero).attr("alt") + "<br />");
                $(hero).wrap("<span class='banned-wrapper'></span>");
            } else {
                $(hero).addClass("picked");
                pickHero(instance.currentPhase().team, hero);
                instance.writeMessage("<span class='" + name + "'>" + writeName + "</span> <b class='green'>picked</b>" + " " + $(hero).attr("alt") + "<br />");
            }
            instance.nextPhase();
            if (instance.isEnd()) instance.writeAlert("Picking phase is done!");
        }
    };

    function pickHero(team, hero) {
        var id = "#hero-outline-" + team.name + "-" + team.pick++ + " img";
        $(id).attr("src", $(hero).attr("src"));
    };

    this.writeMessage = function (message) {
        var chat = $('#chat');
        chat.append(message);
        chat.scrollTop(chat.prop("scrollHeight"));
    };

    this.writeAlert = function (alert) {
        $("#alert").html(alert);
    };
};

var legion = new Team("legion", "Legion");
var hellbourne = new Team("hellbourne", "Hellbourne");

var captainsPick = new CaptainsPick(legion, hellbourne);

$(document).ready(function () {
    // click on hero
    $(".heroes img:not(.not-selectable)").click(function (obj) {
        captainsPick.heroClicked(obj.currentTarget);
    });

    $(".heroes img:not(.not-selectable)").each(function (index, value) {
        $(value).attr("data-toggle", "tooltip");
        $(value).attr("title", $(value).attr("alt"));
    });

    $("#start").click(function () {
        captainsPick.init();
        captainsPick.start();
        $("#start").remove();
    });

    $(document).ready(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
});

function reload() {
    location.reload();
}

