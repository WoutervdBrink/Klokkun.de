const emoji = {};

emoji.dec = (x) => x + String.fromCodePoint(0xFE0F) + String.fromCodePoint(0x20E3);
emoji.decs = (str) => {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        if (c >= 0x30 && c < 0x40) {
            result += emoji.dec(c - 0x30);
        } else {
            result += str[i];
        }
    }
    return result;
}
emoji.clock = (hour, half) => String.fromCodePoint(0x1F54F + hour + (half ? 12 : 0));

const e = (tag, classes, children) => {
    const element = document.createElement(tag);
    if (Array.isArray(classes)) {
        element.classList.add(...classes);
    }
    if (typeof classes === 'string') {
        element.classList.add(classes);
    }
    if (children && children.length) {
        element.append(...children);
    }
    return element;
};

const widgets = [];

const widget = (id, title, callback) => {
    let label, input, button, icon;

    const div = e('div', 'mb-3', [
        label = e('label', [], title),
        e('div', 'input-group', [
            input = e('input', 'form-control'),
            button = e('button', ['btn', 'btn-primary'], [
                icon = e('i', ['bi', 'bi-clipboard'])
            ])
        ])
    ]);

    label.htmlFor = input.id = id;
    input.readOnly = true;

    button.addEventListener('click', () => {
        navigator.clipboard.writeText(input.value);
    });

    document.getElementById('widgets').appendChild(div);

    widgets.push({
        input, callback
    });
};

const regularWidget = (id, title, radix, append) => {
    const pad12 = (12).toString(radix).length;
    const pad60 = (59).toString(radix).length;

    widget(id, title, (d) => {
        const hours = d.getHours().toString(radix).padStart(pad12, '0');
        const minutes = d.getMinutes().toString(radix).padStart(pad60, '0');

        return emoji.decs(hours) + '➖' + emoji.decs(minutes) + append;
    });
};

regularWidget('decimal', 'Decimaal', 10, '');
regularWidget('binary', 'Binair', 2, '🅱️');
regularWidget('octal', 'Octaal', 8, '🅾️');

widget('emoji', 'Emoji', (d) => {
    const hours = d.getHours();
    const minutes = d.getMinutes();

    if (minutes === 30 || minutes === 0) {
        return emoji.clock(hours === 0 ? 12 : hours % 12, minutes === 30);
    }

    if (hours === 3 && minutes === 14) {
        return 'π';
    }

    return 'Er is geen toepasselijke emoji op dit moment :(';
});

setInterval(() => {
    const d = new Date();

    widgets.forEach((widget) => {
        let result = '';
        try {
            result = widget.callback(d);
        } catch (e) {
            // Nou en
            console.error(e);
        }
        widget.input.value = result;
    });
}, 100);