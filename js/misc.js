function runTypewriter() {
    const typewriter = document.querySelector(".typewriter");
    if (!typewriter) return;

    const fullText = typewriter.textContent;

    typewriter.textContent = "";
    let i = 0;

    function typeWriter() {
        if (i < fullText.length) {
            typewriter.textContent += fullText.charAt(i);
            i++;
            setTimeout(typeWriter, 65);
        }
    }

    typeWriter();
}

runTypewriter();