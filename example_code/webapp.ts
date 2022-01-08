function initialize(): void {
  const form = <HTMLFormElement> document.querySelector("#room_login_form")
  form.onsubmit = () => {
    const formData = new FormData(form);
    const roomId  = formData.get('room') as string;
    const username  = formData.get('username') as string;
    window.location.href = `polyuser.html?room=${roomId}&clientName=${username}`
    return false;
  }
}

document.addEventListener("DOMContentLoaded", function() {
  initialize()
}, false);