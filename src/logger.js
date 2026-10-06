var addin = this;

var LOGLEVEL_ERROR   = 0;
var LOGLEVEL_WARNING = 1;
var LOGLEVEL_INFO    = 2;
var LOGLEVEL_DEBUG   = 3;
var LOGLEVEL_TRACE   = 4;

var logLevel =
    LOGLEVEL_INFO;

function getDisplayDate()
{
    var now = new Date();

    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();

    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    return now.getFullYear()
        + "-" + month
        + "-" + day
        + " "
        + hours
        + ":" + minutes
        + ":" + seconds;
}


function write(levelName, message)
{
	Repository.WriteOutput(
		addin.fbaConstants.OUTPUT_TAB,
		 getDisplayDate()
        + " [" + levelName + "]: "
        + message,
		0
	);
	/*
    Session.Output(
        getDisplayDate()
        + " [" + levelName + "]: "
        + message
    );*/
}


return {
	// --------------------------------------------------------
    // Niveaux exposés
    // --------------------------------------------------------

    LOGLEVEL_ERROR:
        LOGLEVEL_ERROR,

    LOGLEVEL_WARNING:
        LOGLEVEL_WARNING,

    LOGLEVEL_INFO:
        LOGLEVEL_INFO,

    LOGLEVEL_DEBUG:
        LOGLEVEL_DEBUG,

    LOGLEVEL_TRACE:
        LOGLEVEL_TRACE,

    error: function(message)
    {
        if (
            logLevel >=
            this.LOGLEVEL_ERROR
        )
        {
            write("ERROR", message);
        }
    },

    warning: function(message)
    {
        if (
            logLevel >=
            this.LOGLEVEL_WARNING
        )
        {
            write("WARNING", message);
        }
    },

    info: function(message)
    {
        if (
            logLevel >=
            this.LOGLEVEL_INFO
        )
        {
            write("INFO", message);
        }
    },

    debug: function(message)
    {
        if (
            logLevel >=
            this.LOGLEVEL_DEBUG
        )
        {
            write("DEBUG", message);
        }
    },

    trace: function(message)
    {
        if (
            logLevel >=
            this.LOGLEVEL_TRACE
        )
        {
            write("TRACE", message);
        }
    },

    setLevel: function(level)
    {
        logLevel = level;
    },

    getLevel: function()
    {
        return logLevel;
    },

    clear: function()
    {
        repository.ClearOutput(
            addin.fbaConstants.OUTPUT_TAB
        );
    },

    show: function()
    {
        repository.EnsureOutputVisible(
            addin.fbaConstants.OUTPUT_TAB
        );
    }
};