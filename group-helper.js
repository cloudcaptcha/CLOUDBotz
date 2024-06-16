const { Markup } = require('telegraf');

module.exports = (bot) => {
    // Middleware to check if a user has a username
    bot.use(async (ctx, next) => {
        if (ctx.message && ctx.message.new_chat_members) {
            ctx.message.new_chat_members.forEach(member => {
                if (!member.username) {
                    ctx.replyWithMarkdown(`⚠️ *Warning* ⚠️\n\nHi ${member.first_name}, please set a username to continue participating in this group.`);
                }
            });
        }
        await next();
    });

    const adminOnly = async (ctx, next) => {
        const admin = await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id);
        if (admin.status === 'administrator' || admin.status === 'creator') {
            return next();
        } else {
            return ctx.reply('🚫 *You need to be an admin to use this command.* 🚫', { parse_mode: 'Markdown' });
        }
    };

    bot.command('kick', adminOnly, async (ctx) => {
        if (ctx.message.reply_to_message) {
            const userId = ctx.message.reply_to_message.from.id;
            await ctx.kickChatMember(ctx.chat.id, userId);
            ctx.reply(`🚫 User has been kicked.`);
        } else {
            ctx.reply('! Please reply to the message of the user you want to kick.');
        }
    });

    bot.command('mute', adminOnly, async (ctx) => {
        if (ctx.message.reply_to_message) {
            const userId = ctx.message.reply_to_message.from.id;
            await ctx.restrictChatMember(ctx.chat.id, userId, { permissions: { can_send_messages: false } });
            ctx.reply(`🔇 User has been muted.`);
        } else {
            ctx.reply('! Please reply to the message of the user you want to mute.');
        }
    });

    bot.command('unmute', adminOnly, async (ctx) => {
        if (ctx.message.reply_to_message) {
            const userId = ctx.message.reply_to_message.from.id;
            await ctx.restrictChatMember(ctx.chat.id, userId, { permissions: { can_send_messages: true } });
            ctx.reply(`🤪 User has been unmuted.`);
        } else {
            ctx.reply('! Please reply to the message of the user you want to unmute.');
        }
    });

    bot.command('report', async (ctx) => {
        if (ctx.message.reply_to_message) {
            const reportedUser = ctx.message.reply_to_message.from;
            const adminList = await ctx.telegram.getChatAdministrators(ctx.chat.id);
            adminList.forEach(admin => {
                ctx.telegram.sendMessage(admin.user.id, `! *Report* !\n\nUser @${ctx.from.username} has reported @${reportedUser.username || reportedUser.first_name}.\n\nMessage:\n${ctx.message.reply_to_message.text}`, { parse_mode: 'Markdown' });
            });
            ctx.reply('√ Your report has been sent to the admins.');
        } else {
            ctx.reply('! Please reply to the message you want to report.');
        }
    });

    bot.on('new_chat_members', (ctx) => {
        ctx.message.new_chat_members.forEach(member => {
            ctx.reply(`👋 Welcome, ${member.first_name}! Please make sure to set a username and read the group rules.`);
        });
    });

    bot.on('left_chat_member', (ctx) => {
        const member = ctx.message.left_chat_member;
        ctx.reply(`👋 Goodbye, ${member.first_name}. We hope to see you again!`);
    });

    bot.command('groupinfo', adminOnly, async (ctx) => {
        const chat = await ctx.getChat();
        const membersCount = await ctx.getChatMembersCount();
        ctx.replyWithMarkdown(`📊 *Group Info* 📊\n\n*Title:* ${chat.title}\n*Description:* ${chat.description || 'N/A'}\n*Members Count:* ${membersCount}`);
    });
};
