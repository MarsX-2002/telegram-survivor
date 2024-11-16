import os
from telegram import Update, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Replace with your bot token
TOKEN = "7592006840:AAF-bqZ2ZrKVNaP696laUMcxJ1qnMzCuKCs"

# Replace with your game URL
GAME_URL = "https://marsx-2002.github.io/telegram-survivor/"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send a message with a button that opens the game."""
    button = KeyboardButton(
        text="Start Game!",
        web_app=WebAppInfo(url=GAME_URL)
    )
    keyboard = ReplyKeyboardMarkup([[button]], resize_keyboard=True)
    
    await update.message.reply_text(
        "Welcome to Survivor! Click the button below to start playing.",
        reply_markup=keyboard
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send a message when the command /help is issued."""
    help_text = """
🎮 *Survivor Game Help*

*Controls:*
Desktop:
- WASD or Arrow keys to move
- Click and drag with mouse

Mobile/Tablet:
- Touch and drag to move

*Objective:*
- Survive as long as possible
- Avoid enemies
- Collect power-ups
- Get the highest score!

*Commands:*
/start - Start the bot
/play - Launch the game
/help - Show this help message

Good luck! 🎯
    """
    await update.message.reply_text(help_text, parse_mode='Markdown')

async def play(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Same as start command."""
    await start(update, context)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle all other messages."""
    await update.message.reply_text(
        "Use /start to get the game button or /help for instructions!"
    )

def main():
    """Start the bot."""
    # Create the Application and pass it your bot's token.
    application = Application.builder().token(TOKEN).build()

    # Add command handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("play", play))
    
    # Handle other messages
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    # Start the Bot
    application.run_polling()

if __name__ == '__main__':
    main()
