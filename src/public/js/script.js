const socket = io();
let timeout;
let clearStateTimeout;
let tabs = [];
let currentTab = '';

socket.on("code", function ({tab, data}) {
  if (tab !== currentTab) {
      return; // Ignore updates for other tabs
  }
  document.getElementById("code-share").value = data;
});

function keyUpEventHandler(event) {
    if (timeout) {
        clearTimeout(timeout);
        document.getElementsByClassName('status')[0].style.display = 'none';
    }
    socket.emit('code', {tab: currentTab, data: event.target.value});
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
    body: JSON.stringify({ tab: currentTab, code: document.getElementById("code-share").value }),
  })
    .then((response) => {
        if (showModal) {
            clearTimeout(timeout)
            if (response.ok) {
              Swal.fire({
                title: "Success",
                text: "Code saved successfully!",
                confirmButtonText: "OK",
                confirmButtonColor: "#007BFF",
                color: "#1b2924",
                background: "#daffe4",
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
            if (document.activeElement.id === 'code-share') {
              document.activeElement.blur();
            }
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

function loadTabs() {
  return fetch("/tabs")
    .then((response) => response.json());
}

function loadCode(tab = '') {
  currentTab = tab;
  const tabList = document.querySelector(".tabs ul");
  tabList.querySelectorAll("li").forEach((li) => {
    li.classList.remove("active");
    if (li.textContent === tab) {
      li.classList.add("active");
    }
  });
  fetch(`/load/${tab}`)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("code-share").value = data.code;
    });
}

document.addEventListener("DOMContentLoaded", function () {
  loadTabs()
    .then((data) => {
      tabs = data.tabs || [];
      const tabList = document.querySelector(".tabs ul");
      tabList.innerHTML = "";
      currentTab = tabs.length > 0 ? tabs[0] : '';
      tabs.forEach((tab) => {
        const li = document.createElement("li");
        li.textContent = tab;
        li.addEventListener("click", () => loadCode(tab));
        tabList.appendChild(li);
        if (tab === currentTab) {
          li.classList.add("active");
        }
      });
      loadCode(currentTab);
    });
});
