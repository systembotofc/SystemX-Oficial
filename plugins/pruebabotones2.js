// Definición del comando `listas`
const handler = {
    help: ['listas'], // Comando de ayuda
    tags: ['listas'], // Etiqueta para categorizar
    command: ['listas', 'list'], // Comandos que activan esta función
    register: true, // Para registrar el comando en el bot
};

// Función que maneja el comando
handler.handle = async (message) => {
    // Extraer el comando del mensaje
    const command = message.content.trim().toLowerCase();

    // Verificar si el comando es uno de los registrados
    if (handler.command.includes(command)) {
        // Responder con diferentes mensajes según el comando
        switch (command) {
            case 'listas2':
            case 'list2':
                // Enviar un mensaje con una lista
                await message.reply('Aquí tienes la lista de comandos disponibles:\n1. Comando 1\n2. Comando 2\n3. Comando 3');
                break;

            // Puedes agregar más casos aquí para otros comandos

            default:
                // Responder con un mensaje de error si el comando no es reconocido
                await message.reply('Comando no reconocido. Usa `.listas` para ver la lista de comandos.');
                break;
        }
    }
};

// Exportar el handler para que pueda ser utilizado en otras partes de la aplicación
export default handler;
