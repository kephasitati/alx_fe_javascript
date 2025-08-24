// Function to add a quote to the list
function addQuote(quote) {
    const list = document.getElementById("quote-list");
    if (!list) {
        console.error("Missing <ul id='quote-list'> in your HTML");
        return;
    }

    const li = document.createElement("li");
    li.textContent = quote;
    list.appendChild(li);
}

// Function to create the form for adding quotes
function createAddQuoteForm() {
    const form = document.createElement("form");

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter a quote";

    const button = document.createElement("button");
    button.type = "submit";
    button.textContent = "Add Quote";

    form.appendChild(input);
    form.appendChild(button);

    // Handle form submission
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const quote = input.value.trim();
        if (quote) {
            addQuote(quote);
            input.value = ""; // reset field
        }
    });

    // Append form to the body
    document.body.appendChild(form);
}

// Call the function so the form shows up when the page loads
createAddQuoteForm();
