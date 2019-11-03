var exeBtn = document.getElementById("execute");
var stdin = document.getElementById("prog-input");
var stdout = document.getElementById("prog-output");
var mutex = 0;

function lock() {
    mutex = 1;
    exeBtn.disabled = true;
}

function unlock() {
    mutex = 0;
    exeBtn.disabled = false;
}

exeBtn.addEventListener("click", (event) => {
    if (mutex == 0) {
        lock();
        var code = editor.getValue();
        $.get(
            "run",
            {
                "code": btoa(code),
                "stdin": btoa(stdin.value)
            },
            function (data, status) {
                var s = atob(data);
                // preserve newlines, etc - use valid JSON
                s = s.replace(/\\n/g, "\\n")
                    .replace(/\\'/g, "\\'")
                    .replace(/\\"/g, '\\"')
                    .replace(/\\&/g, "\\&")
                    .replace(/\\r/g, "\\r")
                    .replace(/\\t/g, "\\t")
                    .replace(/\\b/g, "\\b")
                    .replace(/\\f/g, "\\f");
                // remove non-printable and other non-valid JSON chars
                s = s.replace(/[\u0000-\u0019]+/g, "");
                var xdata = JSON.parse(s);
                if (xdata["stderr"] != null && xdata["stdout"] == null) {
                    stdout.value = xdata["stderr"];
                } else {
                    stdout.value = xdata["stdout"];
                }
                unlock();
            }
        );
    }
});