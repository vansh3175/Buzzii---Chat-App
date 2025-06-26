export default function dateParser(timeStamp){
    const date = new Date(timeStamp);

    const options = {
    weekday: 'short',   // "Mon", "Tue", ...
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    };

    const formatted = date.toLocaleString('en-US', options);

    return formatted;


}
