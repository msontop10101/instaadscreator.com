from lib2 import App

def F(*f):
    return '&amp;'.join('family=' + x for x in f)

def blob(x, y, s, c, blur=50, op=0.7):
    return f'<div aria-hidden="true" style="position: absolute; left: {x}px; top: {y}px; width: {s}px; height: {s}px; border-radius: 50%; background: {c}; filter: blur({blur}px); opacity: {op}"></div>'

def base(**kw):
    kw.setdefault('barbg', kw['bg']); kw.setdefault('barink', kw['ink']); kw.setdefault('barmuted', kw['muted'])
    return kw

A = []

# 01 Glassmorphism (light) — savings app
def a01():
    t = base(bg='#E9ECFF', ink='#15172E', muted='#474B6B', accent='#5B3FE8', aink='#FFFFFF', soft='rgba(255,255,255,0.5)', line='rgba(21,23,46,0.12)',
             card='background: rgba(255,255,255,0.55); border: 1px solid rgba(255,255,255,0.9); border-radius: 24px; backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); box-shadow: 0 8px 32px rgba(60,50,140,0.12)',
             btn='background: #15172E; color: #FFFFFF; border-radius: 16px', btn2='background: rgba(255,255,255,0.6); color: #15172E; border: 1px solid rgba(255,255,255,0.95); border-radius: 16px; backdrop-filter: blur(12px)',
             hf="'Outfit', sans-serif", bf="'Outfit', sans-serif", hw=600, h1=44, h2=30, body=15, phone='#15172E', screen='#F6F5FF', screen2='#E2DEFF', sink='#15172E',
             barbg='#F4F5FF', furl=F('Outfit:wght@400;500;600;700'),
             decor=blob(-60, 60, 260, '#7B61FF') + blob(200, 380, 240, '#FF7AB6') + blob(40, 1200, 280, '#3ED6C5') + blob(220, 2000, 260, '#7B61FF') + blob(-40, 2700, 260, '#FF7AB6'))
    a = App(t)
    a.nav('Stash')
    a.hero('floating', dict(label='Save in naira and dollars', h1='Your money, growing quietly.', sub='Lock savings, earn interest and buy dollar assets from one app. Start with ₦1,000.', screen='Home · total savings',
                            chips=[('+ interest paid today', 'left: 0; top: 90px'), ('Goal: Rent 72%', 'right: 0; top: 260px'), ('Dollar wallet', 'left: 6px; top: 400px')]))
    a.strip([('[4.8]', 'App Store'), ('[200k]+', 'savers'), ('₦1k', 'to start')])
    a.features('Built for how you save', [('Locked savings', 'Hide money from yourself until the date you pick.'), ('Dollar assets', 'Protect savings from naira swings.'), ('Group goals', 'Save with friends for a trip or a wedding.'), ('Instant withdrawal', 'Flexible savings land in your bank in minutes.')], 'list')
    a.screens('Inside the app', ['Savings goals', 'Dollar wallet', 'Interest history'])
    a.reviews('Savers say')
    a.faq([('Is my money safe?', '[Licensing and custodian details]'), ('Can I withdraw anytime?', 'Flexible savings, yes. Locked savings on the date you chose.'), ('Fees?', 'No fees to save. [Withdrawal fee details].')])
    a.final('Start saving today', 'Download free on iPhone and Android')
    a.footer('Stash')
    a.bar('Stash', 'Savings app · Free')
    return 'Glassmorphism', 'Savings app', 'AppGlass', a, None

# 02 Neumorphism — sleep app
def a02():
    neu = 'background: #E4E8EE; border-radius: 28px; box-shadow: 9px 9px 18px #C3C8D0, -9px -9px 18px #FFFFFF'
    t = base(bg='#E4E8EE', ink='#262E3A', muted='#525C6A', accent='#3F51C4', aink='#FFFFFF', soft='#E4E8EE', line='#CDD2DA', card=neu,
             btn='background: #3F51C4; color: #FFFFFF; border-radius: 999px; box-shadow: 6px 6px 14px #C3C8D0, -6px -6px 14px #FFFFFF',
             btn2='background: #E4E8EE; color: #262E3A; border-radius: 999px; box-shadow: 6px 6px 14px #C3C8D0, -6px -6px 14px #FFFFFF',
             hf="'Nunito', sans-serif", bf="'Nunito', sans-serif", hw=800, h1=40, h2=28, body=16, ls='-0.01em', phone='#C9CED6', screen='#E4E8EE', screen2='#D5DAE2', sink='#262E3A',
             furl=F('Nunito:wght@400;600;700;800'))
    a = App(t)
    a.nav('Hush')
    a.hero('center', dict(label='Sleep · Calm · Focus', h1='Fall asleep in 10 minutes, even with generator noise.', sub='Guided sleep stories, rain sounds and breathing exercises. Works offline once downloaded.', screen='Sleep stories'))
    a.strip([('10 min', 'to sleep'), ('300+', 'sounds'), ('Offline', 'no data')])
    a.features('Gentle tools for busy minds', [('Sleep stories', 'Calm voices, including Nigerian narrators.'), ('Noise masking', 'Rain, fan and ocean sounds that cover the generator.'), ('Breathing', '2-minute exercises when stress hits.'), ('Smart alarm', 'Wakes you at the lightest point of sleep.')], 'checks')
    a.steps('Your first night', ['Download Hush and pick your goal', 'Choose a sleep story or sound', 'Put the phone down and breathe'])
    a.pricing('Plans', [('Free', '₦0', ['10 stories', 'Basic sounds']), ('Premium', '₦2,500/mo', ['All 300+ stories and sounds', 'Offline downloads', 'Smart alarm'])])
    a.reviews('Sleepers say')
    a.final('Tonight, sleep better', 'Free 7-day Premium trial')
    a.footer('Hush')
    a.bar('Hush', 'Sleep &amp; calm · Free')
    return 'Neumorphism', 'Sleep & meditation', 'AppNeu', a, None

# 03 Brutalism — food delivery
def a03():
    t = base(bg='#FFE14D', ink='#000000', muted='#2B2B2B', accent='#000000', aink='#FFE14D', soft='#FFFFFF', line='#000000',
             card='background: #FFFFFF; border: 3px solid #000000; border-radius: 0; box-shadow: 6px 6px 0 #000000',
             btn='background: #FF4F1F; color: #000000; border: 3px solid #000000; border-radius: 0; box-shadow: 4px 4px 0 #000000',
             btn2='background: #FFFFFF; color: #000000; border: 3px solid #000000; border-radius: 0; box-shadow: 4px 4px 0 #000000',
             hf="'Archivo Black', sans-serif", bf="'Space Mono', monospace", hw=400, h1=48, h2=32, body=15, upper=True, ls='-0.02em', lh=0.95,
             phone='#000000', screen='#FFFFFF', screen2='#FFE14D', sink='#000000', barbg='#FFFFFF', furl=F('Archivo+Black', 'Space+Mono:wght@400;700'),
             label='font-size: 13px; font-weight: 700; text-transform: uppercase; color: #000000; background: #FFFFFF; border: 2px solid #000000; padding: 4px 8px; align-self: flex-start')
    a = App(t)
    a.nav('Chop Now')
    a.hero('tilt', dict(label='Food in 30 min', h1='Hungry? Chop now.', sub='Amala, suya, shawarma and jollof from 2,000+ Lagos spots. Track your rider live. Pay with transfer or card.', screen='Restaurants near you'))
    a.strip([('30', 'min average'), ('2,000+', 'restaurants'), ('₦0', 'first delivery')])
    a.features('Why Chop Now', [('Live rider tracking', 'See exactly where your food is.'), ('Group orders', 'Everyone adds to one cart, split the bill.'), ('Late-night kitchens', 'Open till 2am in Lekki and Yaba.')], 'list')
    a.screens('Order in 3 taps', ['Pick a spot', 'Build your plate', 'Track rider'])
    a.reviews('Hungry people say')
    a.faq([('Where do you deliver?', 'Lagos mainland and island. Abuja coming soon.'), ('Delivery fee?', 'From ₦500; first order free.'), ('Can I pay on delivery?', 'Yes, by transfer to the rider.')])
    a.final('First delivery free', 'Use code FIRSTCHOP')
    a.footer('Chop Now')
    a.bar('Chop Now', 'Food delivery · Free')
    return 'Brutalism', 'Food delivery', 'AppBrutal', a, None

# 04 Bento grid — tasks
def a04():
    t = base(bg='#F5F5F4', ink='#1C1917', muted='#57534E', accent='#2563EB', aink='#FFFFFF', soft='#E7E5E4', line='#E7E5E4',
             card='background: #FFFFFF; border: 1px solid #E7E5E4; border-radius: 26px',
             btn='background: #1C1917; color: #FFFFFF; border-radius: 14px', btn2='background: #FFFFFF; color: #1C1917; border: 1px solid #D6D3D1; border-radius: 14px',
             hf="'Inter Tight', sans-serif", bf="'Inter Tight', sans-serif", hw=700, h1=42, h2=30, body=15, ls='-0.04em', phone='#1C1917', screen='#FFFFFF', screen2='#F0EFEE', sink='#1C1917',
             furl=F('Inter+Tight:wght@400;500;600;700'))
    a = App(t)
    a.nav('Tasky')
    a.hero('duo', dict(label='For small teams', h1='Every task, every teammate, one place.', sub='Assign work, share files and chat in each task. Replaces the WhatsApp group that never ends.', screen='Team board', screen2='Task details'))
    a.features('Everything in one app', [('Boards and lists', 'Drag tasks across stages, from idea to done.'), ('Due dates', 'Reminders before things slip.'), ('Files', 'Attach docs and photos to tasks.'), ('Chat per task', 'No more scrolling group chats.'), ('Offline', 'Works on bad network, syncs later.'), ('Reports', 'See who is stuck at a glance.')], 'bento')
    a.strip([('5', 'free members'), ('3 min', 'to set up'), ('iOS + Android', 'and web')])
    a.pricing('Simple pricing', [('Free', '₦0', ['Up to 5 members', 'Unlimited tasks']), ('Team', '₦3,000/user/mo', ['Unlimited members', 'Reports and admin', 'Priority support'])])
    a.faq([('Does it work on web?', 'Yes, and on iPhone and Android.'), ('Can clients see tasks?', 'Yes, invite them as guests for free.'), ('Data export?', 'Export everything to CSV anytime.')])
    a.final('Get your team on Tasky', 'Free for teams up to 5')
    a.footer('Tasky')
    a.bar('Tasky', 'Team tasks · Free')
    return 'Bento grid', 'Team tasks', 'AppBento', a, None

# 05 Claymorphism — kids learning
def a05():
    clay = 'background: #FFFFFF; border-radius: 34px; box-shadow: 0 16px 28px rgba(110,80,200,0.18), inset 0 -8px 0 rgba(110,80,200,0.10)'
    t = base(bg='#F1ECFF', ink='#2A1E5C', muted='#5A4F86', accent='#7A5AF8', aink='#FFFFFF', soft='#FFE38A', line='#DED5FB', card=clay,
             btn='background: #7A5AF8; color: #FFFFFF; border-radius: 999px; box-shadow: inset 0 -5px 0 rgba(0,0,0,0.2), 0 8px 16px rgba(122,90,248,0.3)',
             btn2='background: #FFD23F; color: #2A1E5C; border-radius: 999px; box-shadow: inset 0 -5px 0 rgba(0,0,0,0.12)',
             hf="'Quicksand', sans-serif", bf="'Quicksand', sans-serif", hw=700, h1=40, h2=30, body=16, ls='-0.01em', phone='#2A1E5C', screen='#FFF7D6', screen2='#FFE38A', sink='#2A1E5C', atext='#6A47F0',
             furl=F('Quicksand:wght@500;600;700'), decor=blob(260, 120, 120, '#FFD23F', 2, 0.9) + blob(-40, 700, 100, '#7AE7C7', 2, 0.9) + blob(300, 1500, 90, '#FF8FB1', 2, 0.9))
    a = App(t)
    a.nav('ABC Pop')
    a.hero('center', dict(label='Ages 3–8', h1='Reading and maths that feel like play.', sub='Short games that teach phonics, counting and Nigerian languages. No ads, safe for kids.', screen='Letter games'))
    a.strip([('No ads', 'ever'), ('10 min', 'a day'), ('3', 'local languages')])
    a.features('What they learn', [('Phonics', 'Sounds and first words'), ('Counting', 'Numbers up to 100'), ('Yoruba, Igbo, Hausa', 'Songs and words'), ('Drawing', 'Trace letters with a finger')], 'bento')
    a.steps('For parents', ['Create a profile for each child', 'Set a daily time limit', 'Get a weekly progress report'])
    a.pricing('Plans', [('Free', '₦0', ['5 games a day']), ('Family', '₦2,000/mo', ['Unlimited games', 'Up to 4 children', 'Progress reports'])])
    a.final('Let them play and learn', '7 days free for families')
    a.footer('ABC Pop')
    a.bar('ABC Pop', 'Kids learning · Free')
    return 'Claymorphism', 'Kids learning', 'AppClay', a, None

# 06 Retro Y2K — music
def a06():
    chrome = 'background: linear-gradient(180deg, #FFFFFF 0%, #D6DCE8 100%); border: 1.5px solid #8C97AA; border-radius: 22px; box-shadow: inset 0 1px 0 #FFFFFF, 0 6px 14px rgba(40,50,90,0.15)'
    t = base(bg='#DCE3F0', ink='#14112B', muted='#454866', accent='#C2007A', aink='#FFFFFF', soft='#C7D1E3', line='#AEB8CC', card=chrome,
             btn='background: #C2007A; color: #FFFFFF; border-radius: 999px; border: 2px solid #14112B', btn2='background: linear-gradient(180deg, #FFFFFF, #C9D1DE); color: #14112B; border-radius: 999px; border: 2px solid #14112B',
             hf="'Rubik Mono One', sans-serif", bf="'Space Grotesk', sans-serif", hw=400, h1=36, h2=24, body=15, ls='-0.02em', lh=1.1, phone='#14112B', screen='#0F0D24', screen2='#2A2560', sink='#F3F0FF',
             furl=F('Rubik+Mono+One', 'Space+Grotesk:wght@400;500;700'),
             decor=''.join(f'<div aria-hidden="true" style="position: absolute; left: {x}px; top: {y}px; font-size: {s}px; color: {c}">✦</div>' for x, y, s, c in [(320, 110, 30, '#C2007A'), (24, 520, 22, '#3A7BFF'), (330, 980, 26, '#C2007A'), (40, 1700, 30, '#3A7BFF'), (300, 2400, 22, '#C2007A')]))
    a = App(t)
    a.nav('Wavvy')
    a.hero('tilt', dict(label='Afrobeats · Amapiano · Alté', h1='Your playlist, but louder.', sub='Stream millions of songs, follow local artists and save tracks for offline when data runs low.', screen='Now playing'))
    a.strip([('[40m]', 'songs'), ('Offline', 'mode'), ('Lyrics', 'on screen')])
    a.features('Made for the culture', [('Local charts', 'What Lagos, Accra and Nairobi play this week.'), ('Data saver', 'Lower quality when data is tight.'), ('Lyrics', 'Sing along on every track.')], 'alt')
    a.reviews('Listeners say')
    a.pricing('Plans', [('Free', '₦0', ['Shuffle play with ads']), ('Premium', '₦1,200/mo', ['No ads', 'Offline downloads', 'High quality audio'])])
    a.final('Press play', '1 month of Premium free')
    a.footer('Wavvy')
    a.bar('Wavvy', 'Music streaming · Free')
    return 'Retro Y2K', 'Music streaming', 'AppY2K', a, None

# 07 Swiss minimal — news
def a07():
    t = base(bg='#FFFFFF', ink='#111111', muted='#4D4D4D', accent='#D10A11', aink='#FFFFFF', soft='#F2F2F2', line='#111111',
             card='background: #FFFFFF; border-top: 2px solid #111111; border-radius: 0',
             btn='background: #111111; color: #FFFFFF; border-radius: 0', btn2='background: #FFFFFF; color: #111111; border: 2px solid #111111; border-radius: 0',
             hf="'Inter', sans-serif", bf="'Inter', sans-serif", hw=800, h1=58, h2=34, body=15, ls='-0.05em', lh=0.95, phone='#111111', screen='#FFFFFF', screen2='#EDEDED', sink='#111111',
             furl=F('Inter:wght@400;500;700;800'), label='font-size: 12px; font-weight: 700; color: #D10A11; text-transform: uppercase; letter-spacing: 0.02em')
    a = App(t)
    a.nav('Brief.')
    a.hero('bigtype', dict(label='Nº 1 · Daily', h1='The news in 5 minutes. Nothing more.', sub='Ten stories every morning at 7am, written short and checked twice. Business, politics, tech and sport.', screen='Today’s 10'))
    a.strip([('10', 'stories a day'), ('5', 'minutes'), ('7:00', 'every morning')])
    a.features('How Brief works', [('Ten stories', 'Picked by editors, not an algorithm.'), ('Short', 'Each story in under 100 words.'), ('Sources', 'Every story links to the original reporting.'), ('Audio', 'Listen on your commute.')], 'checks')
    a.steps('Your morning', ['Open Brief at 7am', 'Read or listen to 10 stories', 'Go about your day informed'])
    a.faq([('Is it free?', 'Yes. Brief Plus adds audio and archives.'), ('Who writes it?', '[Editorial team details]'), ('Can I choose topics?', 'Yes, mute any section.')])
    a.final('Tomorrow, 7am', 'Free on iPhone and Android')
    a.footer('Brief')
    a.bar('Brief.', 'News in 5 min · Free')
    return 'Swiss minimal', 'News app', 'AppSwiss', a, None

# 08 Neon cyber — esports
def a08():
    neon = 'background: #100E22; border: 1px solid rgba(0,240,255,0.5); border-radius: 14px; box-shadow: 0 0 22px rgba(0,240,255,0.18), inset 0 0 18px rgba(255,43,214,0.06)'
    t = base(bg='#07060F', ink='#F2F0FF', muted='#B4B0D6', accent='#00F0FF', aink='#07060F', soft='#16132E', line='#2A2650', card=neon,
             btn='background: #00F0FF; color: #07060F; border-radius: 10px; box-shadow: 0 0 18px rgba(0,240,255,0.6)', btn2='background: transparent; color: #FF6BE3; border: 1.5px solid #FF2BD6; border-radius: 10px; box-shadow: 0 0 14px rgba(255,43,214,0.4)',
             hf="'Orbitron', sans-serif", bf="'Rajdhani', sans-serif", hw=800, h1=36, h2=24, body=17, upper=True, ls='0.02em', lh=1.1, hx='text-shadow: 0 0 18px rgba(0,240,255,0.55)',
             phone='#2A2650', screen='#0C0A1C', screen2='#1C1840', sink='#F2F0FF', furl=F('Orbitron:wght@700;800', 'Rajdhani:wght@500;600;700'),
             decor=blob(-80, 80, 220, '#FF2BD6', 70, 0.35) + blob(260, 700, 220, '#00F0FF', 70, 0.3) + blob(-60, 1800, 240, '#FF2BD6', 70, 0.3))
    a = App(t)
    a.nav('ARENA')
    a.hero('floating', dict(label='Mobile esports', h1='Play. Rank. Win cash.', sub='Join daily tournaments for CODM, FIFA and eFootball. Climb the ladder and withdraw winnings to your bank.', screen='Live tournaments',
                            chips=[('Rank #12 Lagos', 'left: 0; top: 110px'), ('Prize pool ₦[XXX]k', 'right: 0; top: 300px')]))
    a.strip([('Daily', 'tournaments'), ('Fair', 'anti-cheat'), ('Fast', 'bank payouts')])
    a.features('Built for competitors', [('Brackets', 'Auto-generated and fair.'), ('Squads', 'Team up with friends.'), ('Live chat', 'Trash talk, respectfully.'), ('Payouts', 'Winnings to any Nigerian bank.')], 'list')
    a.screens('In the arena', ['Brackets', 'Squad', 'Wallet'])
    a.faq([('Is it legal?', 'Skill-based tournaments only. [Licensing details]'), ('Minimum age?', '18+ for cash tournaments.'), ('Which games?', 'CODM, FIFA, eFootball and more each month.')])
    a.final('Enter your first tournament', 'Free entry this weekend')
    a.footer('Arena')
    a.bar('ARENA', 'Esports · 18+')
    return 'Neon cyber', 'Esports gaming', 'AppNeon', a, None

# 09 Aurora gradient (dark) — AI assistant
def a09():
    glass = 'background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); border-radius: 20px; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px)'
    t = base(bg='#0B1023', ink='#F4F6FF', muted='#AEB6D6', accent='#9BE7C4', aink='#0B1023', soft='rgba(255,255,255,0.08)', line='rgba(255,255,255,0.14)', card=glass,
             btn='background: #F4F6FF; color: #0B1023; border-radius: 14px', btn2='background: rgba(255,255,255,0.08); color: #F4F6FF; border: 1px solid rgba(255,255,255,0.25); border-radius: 14px',
             hf="'Manrope', sans-serif", bf="'Manrope', sans-serif", hw=800, h1=42, h2=28, body=15, ls='-0.04em', phone='#2A3150', screen='#121831', screen2='#1E2647', sink='#F4F6FF', barbg='#0F152C',
             furl=F('Manrope:wght@400;500;600;700;800'),
             decor=blob(-100, -40, 340, '#3B82F6', 80, 0.55) + blob(180, 160, 300, '#22C55E', 80, 0.35) + blob(60, 380, 260, '#EC4899', 90, 0.35) + blob(-80, 1600, 320, '#6366F1', 90, 0.35) + blob(200, 2400, 300, '#14B8A6', 90, 0.3))
    a = App(t)
    a.nav('Muse')
    a.hero('center', dict(label='AI writing assistant', h1='Write captions, emails and proposals in seconds.', sub='Muse writes in your voice, in English or Pidgin, and remembers your business details.', screen='Ask Muse'))
    a.features('What Muse writes', [('Captions', 'For IG, TikTok and WhatsApp status.'), ('Emails', 'Polite, firm or friendly.'), ('Proposals', 'From a few bullet points.'), ('Replies', 'Answer customers faster.')], 'bento')
    a.steps('How it works', ['Tell Muse about your business once', 'Ask for what you need', 'Edit, copy and send'])
    a.pricing('Plans', [('Free', '₦0', ['20 messages a day']), ('Pro', '₦4,500/mo', ['Unlimited messages', 'Brand voice memory', 'Longer documents'])])
    a.reviews('Creators say')
    a.final('Meet your writing partner', 'Free to start')
    a.footer('Muse')
    a.bar('Muse', 'AI assistant · Free')
    return 'Aurora gradient', 'AI assistant', 'AppAurora', a, '#0B1023'

# 10 Editorial serif — books
def a10():
    t = base(bg='#F7F3EA', ink='#1A1714', muted='#5A524A', accent='#A6361A', aink='#FFFFFF', soft='#ECE4D3', line='#D8CDB8',
             card='background: transparent; border-top: 1px solid #1A1714; border-radius: 0',
             btn='background: #1A1714; color: #F7F3EA; border-radius: 2px', btn2='background: transparent; color: #1A1714; border: 1px solid #1A1714; border-radius: 2px',
             hf="'Newsreader', serif", bf="'Inter', sans-serif", hw=500, h1=46, h2=32, body=15, ls='-0.02em', lh=1.02, phone='#1A1714', screen='#FBF8F1', screen2='#ECE4D3', sink='#1A1714',
             furl=F('Newsreader:ital,wght@0,500;1,500', 'Inter:wght@400;500;600;700'), label='font-size: 12px; font-style: italic; font-family: Newsreader, serif; color: #A6361A; font-size: 16px')
    a = App(t)
    a.nav('Shelf')
    a.hero('bigtype', dict(label='African stories, in your pocket', h1='<em>A library</em> of African books and audiobooks.', sub='Read and listen to Nigerian and African authors. New releases every week. Download for offline.', screen='Now reading'))
    a.features('Inside Shelf', [('[5,000]+ titles', 'Fiction, business, faith and history.'), ('Audiobooks', 'Narrated by African voices.'), ('Offline', 'Download for the road.'), ('Book clubs', 'Read together, discuss in the app.')], 'checks')
    a.screens('Browse', ['New releases', 'Audiobook player', 'Your library'])
    a.reviews('Readers write')
    a.pricing('Membership', [('Monthly', '₦1,800', ['Unlimited reading', 'Unlimited listening']), ('Yearly', '₦18,000', ['2 months free', 'Gift one book a month'])], 0)
    a.final('Your next favourite book', '14 days free')
    a.footer('Shelf')
    a.bar('Shelf', 'Books &amp; audio · 14 days free')
    return 'Editorial serif', 'Books & audiobooks', 'AppEditorial', a, None

# 11 Skeuomorphic — ajo / savings group
def a11():
    paper = 'background: #FFFDF6; border-radius: 6px; box-shadow: 0 1px 0 #D9CDB0, 0 10px 20px rgba(80,60,20,0.16); border: 1px solid #E6DAC0'
    t = base(bg='#F1E7CF', ink='#2E2416', muted='#5E5038', accent='#6B3E1F', aink='#FFF6E8', soft='#E7D9B8', line='#D4C39E', card=paper,
             btn='background: #6B3E1F; color: #FFF6E8; border-radius: 10px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 3px 0 #3E2310, 0 6px 12px rgba(60,30,10,0.25)',
             btn2='background: #FFFDF6; color: #2E2416; border-radius: 10px; border: 1px solid #C9B78E; box-shadow: 0 3px 0 #C9B78E',
             hf="'Caveat', cursive", bf="'Lora', serif", hw=700, h1=50, h2=38, body=16, ls='0', lh=1.0, phone='#3A2A18', screen='#FFFDF6', screen2='#EFE6D0', sink='#2E2416',
             furl=F('Caveat:wght@600;700', 'Lora:wght@400;500;600;700'),
             decor='<div aria-hidden="true" style="position: absolute; inset: 0; background-image: repeating-linear-gradient(180deg, transparent 0 31px, rgba(110,90,50,0.10) 31px 32px)"></div>')
    a = App(t)
    a.nav('Ajo Book')
    a.hero('tilt', dict(label='Esusu, made easy', h1='Run your ajo group without the notebook.', sub='Track who has paid, whose turn it is and send reminders automatically. Everyone sees the same record.', screen='This month’s ajo'))
    a.strip([('0', 'arguments'), ('Auto', 'reminders'), ('Shared', 'record')])
    a.features('Everything the notebook did, better', [('Contribution log', 'Every payment recorded with a date.'), ('Payout order', 'Fair rotation everyone can see.'), ('Reminders', 'WhatsApp nudges before due dates.'), ('Statements', 'Print or share the month’s record.')], 'list')
    a.steps('Start a group', ['Create a group and set the amount', 'Invite members by phone number', 'Mark payments as they come in'])
    a.reviews('Group admins say')
    a.final('Close the notebook', 'Free for groups up to 12')
    a.footer('Ajo Book')
    a.bar('Ajo Book', 'Savings groups · Free')
    return 'Skeuomorphic', 'Ajo / savings groups', 'AppSkeuo', a, None

# 12 Material You — running
def a12():
    t = base(bg='#FFFBFE', ink='#1C1B1F', muted='#49454F', accent='#6750A4', aink='#FFFFFF', soft='#EADDFF', line='#E7E0EC',
             card='background: #F3EDF7; border-radius: 28px', btn='background: #6750A4; color: #FFFFFF; border-radius: 999px', btn2='background: #EADDFF; color: #21005D; border-radius: 999px',
             hf="'Roboto', sans-serif", bf="'Roboto', sans-serif", hw=500, h1=40, h2=28, body=16, ls='0', lh=1.15, phone='#1C1B1F', screen='#FFFBFE', screen2='#EADDFF', sink='#1C1B1F',
             furl=F('Roboto:wght@400;500;700'), label='font-size: 13px; font-weight: 500; color: #21005D; background: #EADDFF; border-radius: 8px; padding: 6px 12px; align-self: flex-start')
    a = App(t)
    a.nav('Pace')
    a.hero('duo', dict(label='Running tracker', h1='Run further, one week at a time.', sub='GPS tracking, coached plans from 5K to marathon and safe routes shared by Lagos runners.', screen='Today’s run', screen2='Weekly plan'))
    a.strip([('5K→42K', 'plans'), ('GPS', 'tracking'), ('Clubs', 'near you')])
    a.features('Your running companion', [('Coached plans', 'Couch to 5K, 10K and marathon.'), ('Safe routes', 'Popular routes with lighting notes.'), ('Run clubs', 'Find Saturday groups near you.'), ('Progress', 'Pace, distance and streaks.')], 'bento')
    a.reviews('Runners say')
    a.pricing('Plans', [('Free', '₦0', ['GPS tracking', 'Route sharing']), ('Pace+', '₦2,000/mo', ['Coached plans', 'Audio coaching', 'Advanced stats'])])
    a.final('Lace up', 'Start your first plan free')
    a.footer('Pace')
    a.bar('Pace', 'Running · Free')
    return 'Material You', 'Running tracker', 'AppMaterial', a, None

# 13 iOS clean — bill splitting
def a13():
    t = base(bg='#F2F2F7', ink='#000000', muted='#5B5B60', accent='#0062CC', aink='#FFFFFF', soft='#E5E5EA', line='#D8D8DD',
             card='background: #FFFFFF; border-radius: 22px', btn='background: #0062CC; color: #FFFFFF; border-radius: 14px', btn2='background: #FFFFFF; color: #0062CC; border-radius: 14px',
             hf="'Figtree', sans-serif", bf="'Figtree', sans-serif", hw=800, h1=40, h2=28, body=16, ls='-0.03em', lh=1.05, phone='#000000', screen='#FFFFFF', screen2='#F2F2F7', sink='#000000',
             furl=F('Figtree:wght@400;500;600;700;800'))
    a = App(t)
    a.nav('Splitr')
    a.hero('center', dict(label='Split bills with friends', h1='Who owes who? Splitr knows.', sub='Split dinner, rent and trips in seconds. Everyone pays their share by transfer, right from the app.', screen='Dinner at Yellow Chilli'))
    a.features('Simple by design', [('Split any way', 'Equally, by item or by percentage.'), ('Pay from the app', 'Send your share by bank transfer.'), ('Friendly reminders', 'Splitr nudges, so you don’t have to.'), ('Trips', 'Track a whole holiday in one place.')], 'checks')
    a.screens('See it in action', ['Add a bill', 'Who owes what', 'Settle up'])
    a.reviews('Friend groups say')
    a.faq([('Do my friends need the app?', 'No, they can pay from a link.'), ('Is it free?', 'Yes. Splitr Plus adds receipts scanning.'), ('Which banks?', 'All Nigerian banks via transfer.')])
    a.final('Never chase money again', 'Free on iPhone and Android')
    a.footer('Splitr')
    a.bar('Splitr', 'Split bills · Free')
    return 'iOS clean', 'Bill splitting', 'AppIOS', a, None

# 14 Memphis — ride-hailing
def a14():
    shapes = ('<svg aria-hidden="true" style="position: absolute; left: 300px; top: 90px" width="60" height="60" viewBox="0 0 60 60"><path d="M30 4L56 52H4z" fill="#FFD23F" stroke="#1B1B3A" stroke-width="3"></path></svg>'
              '<svg aria-hidden="true" style="position: absolute; left: 14px; top: 640px" width="90" height="30" viewBox="0 0 90 30"><path d="M2 15c10-14 20 14 30 0s20 14 30 0 20 14 26 0" fill="none" stroke="#00A39A" stroke-width="4"></path></svg>'
              '<div aria-hidden="true" style="position: absolute; left: 320px; top: 1300px; width: 50px; height: 50px; border-radius: 50%; background: #FF5E5B; border: 3px solid #1B1B3A"></div>'
              '<div aria-hidden="true" style="position: absolute; left: 20px; top: 2100px; width: 70px; height: 70px; background-image: radial-gradient(#1B1B3A 2px, transparent 2.5px); background-size: 12px 12px"></div>')
    t = base(bg='#FFF7E8', ink='#1B1B3A', muted='#4A4A6A', accent='#C42E2B', aink='#FFFFFF', soft='#FFD23F', line='#1B1B3A',
             card='background: #FFFFFF; border: 2.5px solid #1B1B3A; border-radius: 18px', btn='background: #1B1B3A; color: #FFFFFF; border-radius: 14px', btn2='background: #FFD23F; color: #1B1B3A; border: 2.5px solid #1B1B3A; border-radius: 14px',
             hf="'Poppins', sans-serif", bf="'Poppins', sans-serif", hw=800, h1=40, h2=28, body=15, ls='-0.03em', phone='#1B1B3A', screen='#FFFFFF', screen2='#FFF1C9', sink='#1B1B3A', atext='#C42E2B',
             furl=F('Poppins:wght@400;500;600;800'), decor=shapes)
    a = App(t)
    a.nav('Hop')
    a.hero('tilt', dict(label='Keke, bike and car rides', h1='Hop on. Fixed price, no haggling.', sub='Book a keke, bike or car in seconds. See the price before you ride and pay cash or transfer.', screen='Where to?'))
    a.strip([('3', 'ride types'), ('Fixed', 'prices'), ('Verified', 'drivers')])
    a.features('Why riders choose Hop', [('Fixed fares', 'The price you see is the price you pay.'), ('Share trip', 'Family sees your ride live.'), ('Verified drivers', 'ID-checked and rated.')], 'alt')
    a.reviews('Riders say')
    a.faq([('Which cities?', 'Lagos, Ibadan and Port Harcourt.'), ('Can I pay cash?', 'Yes, or transfer.'), ('Can I drive with Hop?', 'Yes, sign up as a driver in the app.')])
    a.final('Your first ride is on us', 'Up to ₦1,000 off')
    a.footer('Hop')
    a.bar('Hop', 'Rides · Free')
    return 'Memphis', 'Ride-hailing', 'AppMemphis', a, None

# 15 Japanese zen — journaling
def a15():
    t = base(bg='#F6F4EF', ink='#1E1E1E', muted='#575550', accent='#9C2F25', aink='#FFFFFF', soft='#ECE8DE', line='#DAD5CA',
             card='background: transparent; border: 1px solid #DAD5CA; border-radius: 0', btn='background: #1E1E1E; color: #F6F4EF; border-radius: 0', btn2='background: transparent; color: #1E1E1E; border: 1px solid #1E1E1E; border-radius: 0',
             hf="'Shippori Mincho', serif", bf="'Zen Kaku Gothic New', sans-serif", hw=600, h1=38, h2=26, body=15, ls='0.02em', lh=1.35, phone='#1E1E1E', screen='#FBFAF7', screen2='#ECE8DE', sink='#1E1E1E',
             furl=F('Shippori+Mincho:wght@500;600', 'Zen+Kaku+Gothic+New:wght@400;500;700'), px=28,
             label='font-size: 12px; letter-spacing: 0.3em; color: #9C2F25; text-transform: uppercase',
             decor='<div aria-hidden="true" style="position: absolute; right: 28px; top: 110px; width: 44px; height: 44px; border-radius: 50%; background: #9C2F25"></div>')
    a = App(t)
    a.nav('Still')
    a.hero('bigtype', dict(label='Journal · 3 minutes a day', h1='A quiet place for your thoughts.', sub='One gentle prompt each morning. Write a line or a page. Private by default, locked with your face or PIN.', screen='Today’s prompt'))
    a.features('Less, but better', [('One prompt', 'A single question each day.'), ('Private', 'Encrypted and locked.'), ('Look back', 'See this day last year.')], 'checks')
    a.steps('The practice', ['Open Still with your morning tea', 'Answer one question', 'Close the app and begin your day'])
    a.reviews('Words from writers', 1)
    a.final('Begin tomorrow morning', 'Free, with no ads')
    a.footer('Still')
    a.bar('Still', 'Journal · Free')
    return 'Japanese zen', 'Journaling', 'AppZen', a, None

# 16 70s groovy — podcasts
def a16():
    stripes = '<div aria-hidden="true" style="position: absolute; left: 0; right: 0; top: 74px; height: 36px; background: repeating-linear-gradient(180deg, #D9541E 0 12px, #E8A33D 12px 24px, #6B8F3A 24px 36px)"></div>'
    t = base(bg='#F6E7CB', ink='#3B2314', muted='#5E4330', accent='#A63D14', aink='#FFF4E0', soft='#EFD6A8', line='#D9BE8E',
             card='background: #FFF4E0; border: 2px solid #3B2314; border-radius: 30px', btn='background: #A63D14; color: #FFF4E0; border-radius: 999px; border: 2px solid #3B2314', btn2='background: #E8A33D; color: #3B2314; border-radius: 999px; border: 2px solid #3B2314',
             hf="'Shrikhand', cursive", bf="'DM Sans', sans-serif", hw=400, h1=40, h2=30, body=15, ls='0', lh=1.05, phone='#3B2314', screen='#FFF4E0', screen2='#EFD6A8', sink='#3B2314',
             furl=F('Shrikhand', 'DM+Sans:wght@400;500;700'), decor=stripes)
    a = App(t)
    a.nav('Groove FM')
    a.parts.append('<div style="height: 44px"></div>'); a.h += 44
    a.hero('center', dict(label='Podcasts &amp; radio', h1='Good talk, good tunes, all day.', sub='Nigerian podcasts and live radio stations in one app. Save episodes for traffic.', screen='Now playing'))
    a.strip([('[800]+', 'podcasts'), ('[60]', 'radio stations'), ('Offline', 'episodes')])
    a.features('Tune in to', [('Business talk', 'Money, hustle and career shows.'), ('Comedy', 'Laugh through traffic.'), ('Faith', 'Sermons and devotionals.'), ('Live radio', 'Your favourite FM stations.')], 'list')
    a.reviews('Listeners say')
    a.final('Turn it up', 'Free forever, with optional Premium')
    a.footer('Groove FM')
    a.bar('Groove FM', 'Podcasts · Free')
    return '70s groovy', 'Podcasts & radio', 'AppGroovy', a, None

# 17 Corporate trust — SME banking
def a17():
    t = base(bg='#F7F9FC', ink='#0B1B33', muted='#4A5A72', accent='#0B4FD8', aink='#FFFFFF', soft='#E6EDF8', line='#DDE4EF',
             card='background: #FFFFFF; border: 1px solid #DDE4EF; border-radius: 12px; box-shadow: 0 1px 2px rgba(11,27,51,0.06)',
             btn='background: #0B4FD8; color: #FFFFFF; border-radius: 10px', btn2='background: #FFFFFF; color: #0B1B33; border: 1px solid #C7D2E3; border-radius: 10px',
             hf="'IBM Plex Sans', sans-serif", bf="'IBM Plex Sans', sans-serif", hw=600, h1=36, h2=26, body=15, ls='-0.02em', lh=1.12, phone='#0B1B33', screen='#FFFFFF', screen2='#E6EDF8', sink='#0B1B33',
             furl=F('IBM+Plex+Sans:wght@400;500;600;700'))
    a = App(t)
    a.nav('Vault Business')
    a.hero('duo', dict(label='Business banking', h1='A business account you can open from your phone.', sub='Get an account number in minutes. Send invoices, accept transfers and pay staff from one app.', screen='Business balance', screen2='Invoices'))
    a.strip([('10 min', 'account opening'), ('Free', 'transfers*'), ('24/7', 'support')])
    a.features('Run the money side of your business', [('Invoices', 'Send and get paid by transfer.'), ('Payroll', 'Pay staff in one tap each month.'), ('Sub-accounts', 'Separate tax, rent and savings.'), ('Team access', 'Give your accountant view-only access.')], 'list')
    a.faq([('Who can open an account?', 'Registered businesses and sole traders. [CAC requirements]'), ('Is it licensed?', '[Licence and deposit insurance details]'), ('*Transfer fees?', '[Free transfer allowance and fees]')])
    a.final('Open your business account', 'Takes about 10 minutes')
    a.footer('Vault Business')
    a.bar('Vault Business', 'Business banking')
    return 'Corporate trust', 'SME banking', 'AppCorporate', a, None

# 18 Dark luxury — dating
def a18():
    t = base(bg='#0D0B0A', ink='#F4EDE4', muted='#B9AE9F', accent='#D8B98A', aink='#0D0B0A', soft='#1A1715', line='#2E2925',
             card='background: #151210; border: 1px solid #2E2925; border-radius: 2px', btn='background: #D8B98A; color: #0D0B0A; border-radius: 2px', btn2='background: transparent; color: #F4EDE4; border: 1px solid #D8B98A; border-radius: 2px',
             hf="'Prata', serif", bf="'Montserrat', sans-serif", hw=400, h1=40, h2=28, body=14, ls='0', lh=1.15, phone='#2E2925', screen='#151210', screen2='#26211D', sink='#F4EDE4',
             furl=F('Prata', 'Montserrat:wght@400;500;600;700'), label='font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #D8B98A')
    a = App(t)
    a.nav('Kindred')
    a.hero('center', dict(label='For serious relationships', h1='Fewer matches. Better ones.', sub='Verified profiles, values-based matching and no endless swiping. For people ready to settle down.', screen='Today’s introductions'))
    a.features('Dating, done with intention', [('Verified', 'Photo and ID checks on every profile.'), ('Values first', 'Faith, family and future plans upfront.'), ('Three a day', 'Curated introductions, not infinite swipes.'), ('Private', 'Hide your profile from contacts.')], 'checks')
    a.screens('A calmer way to meet', ['Profile', 'Introductions', 'Chat'])
    a.reviews('Couples say', 1)
    a.pricing('Membership', [('Free', '₦0', ['3 introductions a day']), ('Kindred+', '₦6,000/mo', ['See who liked you', 'Unlimited messages', 'Priority verification'])])
    a.final('Meet someone worth it', '18+ · Verified members only')
    a.footer('Kindred')
    a.bar('Kindred', 'Dating · 18+')
    return 'Dark luxury', 'Dating', 'AppLuxe', a, None

# 19 Hand-drawn sketch — language learning
def a19():
    wob = 'border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px'
    t = base(bg='#FFFEF8', ink='#222222', muted='#4F4F4F', accent='#1F5BD8', aink='#FFFFFF', soft='#FFF3B0', line='#222222',
             card=f'background: #FFFFFF; border: 2.5px solid #222222; {wob}', btn=f'background: #1F5BD8; color: #FFFFFF; border: 2.5px solid #222222; {wob}', btn2=f'background: #FFF3B0; color: #222222; border: 2.5px solid #222222; {wob}',
             hf="'Gochi Hand', cursive", bf="'Patrick Hand', cursive", hw=400, h1=46, h2=34, body=18, ls='0', lh=1.0, phone='#222222', screen='#FFFEF8', screen2='#FFF3B0', sink='#222222',
             furl=F('Gochi+Hand', 'Patrick+Hand'), label='font-size: 18px; color: #1F5BD8; text-decoration: underline wavy #1F5BD8')
    a = App(t)
    a.nav('Lingo Naija')
    a.hero('tilt', dict(label='Yoruba · Igbo · Hausa', h1='Speak your mother tongue with confidence.', sub='5-minute lessons with real speakers. Learn greetings, proverbs and how to bargain at the market.', screen='Lesson 4 · Greetings'))
    a.strip([('5 min', 'lessons'), ('3', 'languages'), ('Real', 'voices')])
    a.features('How you will learn', [('Listen', 'Native speakers, everyday phrases.'), ('Speak', 'The app checks your pronunciation.'), ('Play', 'Games and streaks keep you going.'), ('Culture', 'Proverbs and the stories behind them.')], 'bento')
    a.reviews('Learners say')
    a.pricing('Plans', [('Free', '₦0', ['1 language, 3 lessons a day']), ('Family', '₦2,500/mo', ['All 3 languages', 'Up to 4 learners', 'Offline lessons'])])
    a.final('Say your first sentence today', 'Free to start')
    a.footer('Lingo Naija')
    a.bar('Lingo Naija', 'Learn languages · Free')
    return 'Hand-drawn', 'Language learning', 'AppSketch', a, None

# 20 Terminal — dev tool
def a20():
    t = base(bg='#0C0F0A', ink='#D7FFD9', muted='#9FC2A2', accent='#39FF6A', aink='#0C0F0A', soft='#141A12', line='#2F4F33',
             card='background: #11160F; border: 1px dashed #2F4F33; border-radius: 4px', btn='background: #39FF6A; color: #0C0F0A; border-radius: 4px', btn2='background: transparent; color: #39FF6A; border: 1px solid #39FF6A; border-radius: 4px',
             hf="'JetBrains Mono', monospace", bf="'JetBrains Mono', monospace", hw=700, h1=32, h2=22, body=14, ls='-0.02em', lh=1.15, phone='#2F4F33', screen='#0C0F0A', screen2='#1B2618', sink='#D7FFD9',
             furl=F('JetBrains+Mono:wght@400;500;700'), label='font-size: 13px; color: #39FF6A')
    a = App(t)
    a.nav('shipyard')
    a.hero('bigtype', dict(label='$ shipyard deploy --prod', h1='Deploy from your phone. Roll back from your bed.', sub='Watch builds, read logs and roll back releases from a mobile app built for on-call engineers.', screen='~/deploys'))
    a.strip([('&lt;1s', 'push alerts'), ('1 tap', 'rollback'), ('SSO', 'ready')])
    a.features('# features', [('Live logs', 'Stream logs with search and filters.'), ('Rollbacks', 'One tap, with a confirm step.'), ('Alerts', 'Push alerts for failed builds.'), ('Audit trail', 'Who shipped what, and when.')], 'list')
    a.steps('$ setup', ['Connect GitHub or GitLab', 'Link your cloud account', 'Get alerts on your phone'])
    a.pricing('Pricing', [('Hobby', '$0', ['1 project', 'Basic alerts']), ('Team', '$12/seat/mo', ['Unlimited projects', 'SSO and audit log', 'On-call schedules'])])
    a.final('git push, then relax', 'Free for side projects')
    a.footer('shipyard')
    a.bar('shipyard', 'Dev tool · Free plan')
    return 'Terminal', 'Developer tool', 'AppTerminal', a, None

A = [a01, a02, a03, a04, a05, a06, a07, a08, a09, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20]
