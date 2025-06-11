const socket = io();
let timeout;
let clearStateTimeout;

socket.on("code", function (data) {
  document.getElementById("code-share").value = data;
});

function keyUpEventHandler(event) {
    if (timeout) {
        clearTimeout(timeout);
        document.getElementsByClassName('status')[0].style.display = 'none';
    }
    socket.emit('code', event.target.value);
    timeout = setTimeout(() => {
        console.log("Saving code automatically...");
        saveCode(false);
        clearStateTimeout = setTimeout(() => {
            document.getElementsByClassName('status')[0].style.display = 'none';
        }, 5000);
    }, 15000);
}

function saveCode(showModal = true) {
  fetch("/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code: document.getElementById("code-share").value }),
  })
    .then((response) => {
        if (showModal) {
            clearTimeout(timeout)
            if (response.ok) {
              Swal.fire({
                title: "Success",
                text: "Code saved successfully!",
                confirmButtonText: "OK",
                color: "#1b2924",
                background: "#f0f3bd",
                timer: 2500
              });
            } else {
              Swal.fire({
                title: "Error",
                text: "Failed to save code.",
                icon: "error",
                confirmButtonText: "OK",
              });
            }
        } else {
            document.getElementsByClassName('status')[0].style.display = 'flex';
        }
    })
    .catch((error) => {
      Swal.fire({
        title: "Error",
        text: "An error occurred while saving code.",
        icon: "error",
        confirmButtonText: "OK",
      });
    });
}

function loadCode() {
  fetch("/load")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("code-share").value = data.code;
    });
}

document.addEventListener("DOMContentLoaded", function () {
  loadCode();
});
