from lib import Page

def wa(label='Order on WhatsApp', short='Buy on WhatsApp'):
    return dict(type='whatsapp', label=label, short=short)

def F(*fams):
    return '&amp;'.join('family=' + f for f in fams)

T = []

# 01 Perfume oils — dark luxe
def t01():
    t = dict(bg='#14110F', surface='#1E1915', soft='#2A231D', line='#3A3129', ink='#F3EBDD', muted='#BFB4A3', accent='#C9A45C', aink='#14110F',
             dark='#F3EBDD', dink='#14110F', hf="'Cormorant Garamond', serif", bf="'Jost', sans-serif", hw=600, ls='0', r=4, br=2,
             furl=F('Cormorant+Garamond:wght@600;700', 'Jost:wght@400;500;600;700'), method=wa(), opts=['#C9A45C', '#B7895A', '#D8C3A5'])
    p = Page(t)
    p.announce('Free delivery in Lagos on 2 bottles or more', 'soft')
    p.header('OUD HOUSE', 'Lekki · Abuja', 'center')
    p.hero('fullbleed', dict(eyebrow='Long-lasting perfume oil', h1='Smell expensive from morning till midnight.', sub='Concentrated oud and amber oil. Two drops last all day, and people will ask what you are wearing.',
                             img='Hero · bottle on dark marble', price='₦18,500', old='₦25,000', trust='Pay on delivery · Sealed bottles'))
    p.benefits('The notes', [('Top:', 'Saffron and bergamot'), ('Heart:', 'Rose and oud wood'), ('Base:', 'Amber, musk and vanilla'), ('Lasts:', '12+ hours on skin, days on clothes')], 'checks')
    p.offer('Pick your size', [('3 ml roll-on', '₦6,500'), ('12 ml', '₦18,500'), ('30 ml', '₦38,000'), ('Gift box of 3', '₦45,000')], 'grid')
    p.gallery(['Bottle close-up', 'Gift box', 'Roll-on in hand', 'Customer unboxing'], 'grid')
    p.proof('What buyers say', 'quotes', 2)
    p.faq([('Is it original?', 'Yes. Every bottle is sealed and batch-numbered.'), ('Will it stain clothes?', 'No. Apply to pulse points, not fabric.'), ('Delivery time?', 'Lagos 24 hrs, other states 2–4 days.')])
    p.final('Your new signature scent', 'Limited batch this month', 'dark')
    p.footer('Oud House', 'Lagos')
    p.buybar('12 ml Oud Amber', '₦18,500', 'pill')
    return 'Oud', 'Perfume oils', 'TplOud', p

# 02 Aso-ebi / Ankara — vibrant
def t02():
    t = dict(bg='#FFF8EE', surface='#FFFFFF', soft='#F6D9B8', line='#EDD3B6', ink='#2A1408', muted='#6B4A36', accent='#B8311A', aink='#FFFFFF',
             hf="'Bricolage Grotesque', sans-serif", bf="'Inter', sans-serif", hw=800, ls='-0.03em', r=20, br=14,
             furl=F('Bricolage+Grotesque:wght@700;800', 'Inter:wght@400;500;600;700'), method=wa('Reserve my yards'), opts=['#B8311A', '#1D5C4A', '#5B2A86'])
    p = Page(t)
    p.announce(['New aso-ebi drop', 'Owambe ready', 'Ships nationwide'], 'marquee')
    p.header('Owambe Edit', '@owambeedit')
    p.hero('collage', dict(eyebrow='For the whole family', h1='Aso-ebi that makes the photographer call your name.', sub='Premium Ankara and lace sold by the yard. Matching sets for 5 to 500 guests.',
                           img='Model in Ankara gown', img2='Fabric swatch', img3='Group photo at owambe', price='₦9,500 / yard', old='₦12,000', trust='Bulk orders get free tailoring consult'))
    p.offer('Choose a colourway', [('Coral Gold', 'Ankara · ₦9,500/yd'), ('Emerald Queen', 'Lace · ₦14,000/yd'), ('Royal Purple', 'Ankara · ₦9,500/yd'), ('Champagne', 'Lace · ₦16,500/yd')], 'grid', 0)
    p.offer('Ordering for a group?', [('1–10 yards', 'Personal order', '₦9,500/yd'), ('11–50 yards', 'Family package', '₦8,800/yd', 'POPULAR'), ('50+ yards', 'Celebrant bulk', '₦8,000/yd')], 'list')
    p.steps('How to order', ['Pick a colourway and tell us how many yards', 'We send fabric photos on WhatsApp', 'Pay on delivery or by transfer for bulk'], 'circles')
    p.proof('Owambe moments', 'shots')
    p.faq([('Can I see the fabric first?', 'Yes, we send video before you pay.'), ('Do you sew?', 'We connect you with our tailors for bulk orders.'), ('How fast for 100 yards?', 'Usually 3–5 days.')])
    p.final('Your event deserves this', 'Colourways sell out fast', 'accent')
    p.footer('Owambe Edit', 'Balogun, Lagos')
    p.buybar('Coral Gold Ankara', '₦9,500 / yard', 'flat')
    return 'Owambe', 'Aso-ebi & Ankara', 'TplOwambe', p

# 03 Land / real estate — trust navy
def t03():
    t = dict(bg='#F5F7FA', surface='#FFFFFF', soft='#DCE4EE', line='#D3DCE7', ink='#0E1B2C', muted='#4A5868', accent='#1F4E8C', aink='#FFFFFF',
             hf="'Instrument Serif', serif", bf="'Inter', sans-serif", hw=400, ls='-0.01em', r=10, br=10,
             furl=F('Instrument+Serif', 'Inter:wght@400;500;600;700'), method=wa('Book a free inspection', 'Book inspection'), opts=['#1F4E8C', '#0F5E4C', '#7A2E2E'])
    p = Page(t)
    p.announce('Free inspection every Saturday · Transport provided from Lekki Phase 1', 'ink')
    p.header('Plot &amp; Key', 'RC [NUMBER]')
    p.hero('stack', dict(eyebrow='Ibeju-Lekki · Dry land', h1='Own a 600 sqm plot near the Free Trade Zone.', sub='Fenced, gated estate with good road access. Pay in instalments over 12 months.', hs=36,
                         img='Estate gate and plots (drone)', price='₦8,500,000', old='₦10,000,000', badge='Promo price', trust='Registered survey · Deed of assignment'))
    p.specs('The facts', [('Plot size', '600 sqm'), ('Title', '[Certificate of Occupancy]'), ('Location', 'Ibeju-Lekki, Lagos'), ('Initial deposit', '₦2,000,000'), ('Instalments', 'Up to 12 months'), ('Land use', 'Residential')])
    p.compare('Why this estate', 'This estate', 'Typical plot', [('Title verified', 'Yes', 'Often unclear'), ('Gated + fenced', 'Yes', 'No'), ('Instalments', '12 months', 'Full payment'), ('Free inspection', 'Every Saturday', 'Paid')])
    p.steps('From inspection to keys', ['Book a free Saturday inspection', 'Pay your deposit and get an allocation letter', 'Complete payments and receive your documents'], 'timeline')
    p.guarantee('Verified documents', 'Every buyer gets copies of the title and survey to check with their own lawyer before paying.')
    p.faq([('Can my lawyer check the papers?', 'Yes, we encourage it before any payment.'), ('Can I build immediately?', 'Yes, once you have your allocation.'), ('Are there other fees?', 'Survey and documentation fees are listed upfront.')])
    p.final('See it before you pay', 'Spaces on Saturday buses are limited', 'dark')
    p.footer('Plot &amp; Key Realty', 'Lekki, Lagos')
    p.buybar('600 sqm · Ibeju-Lekki', '₦8.5m', 'flat')
    return 'Estate', 'Land & real estate', 'TplEstate', p

# 04 Cakes — playful pink
def t04():
    t = dict(bg='#FFF4F7', surface='#FFFFFF', soft='#FFD6E4', line='#F7D3DF', ink='#3B1424', muted='#7A4A5C', accent='#C72A63', aink='#FFFFFF',
             hf="'Fredoka', sans-serif", bf="'Nunito', sans-serif", hw=600, ls='0', r=24, br=999,
             furl=F('Fredoka:wght@500;600', 'Nunito:wght@400;600;700'), method=wa('Order my cake'), opts=['#C72A63', '#7B3FA0', '#B4541A'])
    p = Page(t)
    p.announce('Order 48 hours ahead · Free delivery within Yaba', 'accent')
    p.header('Sugar Rush', 'Yaba, Lagos', 'center')
    p.hero('centered', dict(eyebrow='Birthday cakes', h1='The cake they will still talk about next year.', sub='Soft red velvet, vanilla or chocolate. Custom names and colours at no extra cost.',
                            img='Hero · 2-tier birthday cake', price='From ₦22,000', trust='Delivered boxed and chilled'))
    p.offer('Pick a size', [('6 inch', 'Serves 10 · ₦22,000'), ('8 inch', 'Serves 20 · ₦32,000'), ('2-tier', 'Serves 40 · ₦58,000'), ('Cupcakes ×12', '₦14,000')], 'grid')
    p.gallery(['Red velvet slice', 'Kids theme cake', 'Cupcake box', 'Wedding cake'], 'strip')
    p.countdown('Next free delivery slot closes in', ('00', '05', '42', '18'))
    p.steps('How it works', ['Send your date, size and flavour', 'Approve the design sketch on WhatsApp', 'We deliver on the day, boxed and chilled'], 'circles')
    p.proof('Sweet words', 'quotes', 2)
    p.final('Make their day', 'Weekend slots fill up first', 'accent')
    p.footer('Sugar Rush Cakes', 'Yaba')
    p.buybar('8 inch red velvet', '₦32,000', 'pill')
    return 'Sugar', 'Cakes & pastries', 'TplSugar', p

# 05 Hair growth oil — botanical
def t05():
    t = dict(bg='#F3F6EF', surface='#FFFFFF', soft='#D7E4CF', line='#D2DDCB', ink='#1D2B1F', muted='#4D5E4F', accent='#2F6B3A', aink='#FFFFFF',
             hf="'DM Serif Display', serif", bf="'DM Sans', sans-serif", hw=400, ls='-0.01em', r=14, br=12,
             furl=F('DM+Serif+Display', 'DM+Sans:wght@400;500;600;700'), method=dict(type='form', label='Order now, pay on delivery', short='Order now'), opts=['#2F6B3A', '#6B4E2F', '#2F4F6B'])
    p = Page(t)
    p.announce('Pay on delivery anywhere in Nigeria', 'ink')
    p.header('Root &amp; Thrive', 'Natural hair care')
    p.hero('stack', dict(eyebrow='For thinning edges', h1='Thicker edges in 8 weeks, or your money back.', sub='Rosemary, castor and pumpkin seed oil, cold-pressed. Massage in 3 times a week.',
                         img='Hero · dropper bottle with herbs', price='₦12,500', old='₦16,000', badge='-22%', trust='Made in Nigeria · NAFDAC [NUMBER]'))
    p.proof('Real results', 'beforeafter')
    p.benefits('Why it works', [('Rosemary oil', 'wakes up the scalp and supports growth'), ('Castor oil', 'thickens and seals in moisture'), ('Pumpkin seed oil', 'helps reduce shedding'), ('No mineral oil', 'nothing to clog your scalp')], 'cards')
    p.offer('Choose your pack', [('1 bottle', '4-week supply', '₦12,500'), ('2 bottles', 'The full 8 weeks', '₦22,000', 'BEST VALUE'), ('3 bottles + comb', 'For you and a friend', '₦31,000')], 'list')
    p.guarantee('8-week guarantee', 'Use it as directed for 8 weeks. If you see no difference, send your before and after photos and we refund you.')
    p.faq([('Is it safe for relaxed hair?', 'Yes, and for natural and locs.'), ('How long does a bottle last?', 'About 4 weeks at 3 uses a week.'), ('Can men use it?', 'Yes, for beards and hairlines too.')])
    p.final('Start your 8 weeks today', 'Free scalp massage comb on 2+ bottles', 'dark')
    p.footer('Root &amp; Thrive', 'Ibadan')
    p.buybar('2 bottles · 8 weeks', '₦22,000', 'flat')
    return 'Botanica', 'Hair growth oil', 'TplBotanica', p

# 06 Power banks — dark lime
def t06():
    t = dict(bg='#0E0E0E', surface='#161616', soft='#1F1F1F', line='#2A2A2A', ink='#F5F5F5', muted='#B5B5B5', accent='#C6F432', aink='#0E0E0E',
             dark='#C6F432', dink='#0E0E0E', hf="'Unbounded', sans-serif", bf="'Inter', sans-serif", hw=700, ls='-0.02em', r=18, br=14, upper=True,
             furl=F('Unbounded:wght@600;700', 'Inter:wght@400;500;600;700'), method=wa(), opts=['#C6F432', '#5CE1E6', '#FF8A3D'])
    p = Page(t)
    p.hero('poster', dict(eyebrow='20,000 mAh · Fast charge', h1='NEPA took light. You did not.', sub='Charge your phone 5 times on one power bank. 22.5 W fast charging, built-in cables, fits in your pocket.', hs=44,
                          img='Hero · power bank charging phone', price='₦24,000', old='₦32,000', badge='SAVE ₦8k', trust='6-month warranty · Test before you pay'))
    p.trust([('5×', 'phone charges'), ('22.5 W', 'fast charge'), ('3', 'devices at once')], 'row')
    p.specs('Specs', [('Capacity', '20,000 mAh'), ('Output', '22.5 W USB-C PD'), ('Cables', 'Type-C + Lightning built in'), ('Recharge time', 'About 4 hours'), ('Weight', '[WEIGHT] g')])
    p.compare('Not all power banks are equal', 'Ours', 'Market one', [('Real capacity', 'Tested', 'Often less'), ('Fast charge', 'Yes', 'Rarely'), ('Warranty', '6 months', 'None')])
    p.countdown('Flash price ends in')
    p.proof('Buyers on WhatsApp', 'shots')
    p.faq([('Can I fly with it?', 'Yes, 20,000 mAh is allowed in hand luggage.'), ('iPhone and Android?', 'Yes, both cables are built in.'), ('Can I test it?', 'Yes, our rider waits while you test.')])
    p.final('Never hit 1% again', 'Flash price today only', 'accent')
    p.footer('Juice Box', 'Ikeja')
    p.buybar('Juice Box 20K', '₦24,000', 'pill')
    return 'Volt', 'Power banks & phone accessories', 'TplVolt', p

# 07 Kids wear — playful primary
def t07():
    t = dict(bg='#FFFBEA', surface='#FFFFFF', soft='#FFE38A', line='#F2E2A6', ink='#23213A', muted='#55536B', accent='#2C5CC5', aink='#FFFFFF',
             hf="'Baloo 2', sans-serif", bf="'Nunito', sans-serif", hw=800, ls='-0.01em', r=22, br=16,
             furl=F('Baloo+2:wght@700;800', 'Nunito:wght@400;600;700'), method=wa(), opts=['#2C5CC5', '#C2361F', '#1F7A4D'])
    p = Page(t)
    p.announce('Buy 3 sets, get free delivery', 'accent')
    p.header('Tiny Tots', 'Ages 0–8')
    p.hero('centered', dict(eyebrow='100% cotton sets', h1='Soft enough for naps. Tough enough for play.', sub='Breathable cotton shorts-and-top sets that survive the washing machine and the playground.',
                            img='Hero · kids playing in sets', price='₦8,500 / set', old='₦11,000', arch=False, trust='Free size exchange within 7 days'))
    p.offer('Pick an age', [('0–6 months', '₦7,500'), ('1–2 years', '₦8,500'), ('3–5 years', '₦9,000'), ('6–8 years', '₦9,500')], 'grid')
    p.benefits('Mums love them because', [('No itch', 'tag-free and soft seams'), ('No fade', 'colours stay after 50 washes'), ('No fuss', 'easy snaps for nappy changes')], 'numbered')
    p.gallery(['Dino set', 'Rainbow set', 'Twins in matching sets', 'Folded set'], 'grid')
    p.proof('Happy parents', 'quotes', 2)
    p.faq([('How do sizes run?', 'True to age. Size up if your child is tall.'), ('Can I mix designs?', 'Yes, mix any 3 for free delivery.'), ('Is the fabric safe?', '100% cotton, no harsh dyes.')])
    p.final('Dress them for the fun part', 'New designs every month', 'dark')
    p.footer('Tiny Tots', 'Surulere')
    p.buybar('Dino set · 1–2 yrs', '₦8,500', 'flat')
    return 'Playful', 'Kids clothing', 'TplPlayful', p

# 08 Shapewear — bold black/pink
def t08():
    t = dict(bg='#111111', surface='#1A1A1A', soft='#262626', line='#333333', ink='#FAFAFA', muted='#BDBDBD', accent='#FF4D8D', aink='#111111',
             dark='#FF4D8D', dink='#111111', hf="'Anton', sans-serif", bf="'Inter', sans-serif", hw=400, ls='0.01em', r=6, br=6, upper=True,
             furl=F('Anton', 'Inter:wght@400;500;600;700'), method=wa(), opts=['#FF4D8D', '#FF8A3D', '#B98CFF'])
    p = Page(t)
    p.announce('Discreet packaging · Pay on delivery', 'accent')
    p.hero('poster', dict(eyebrow='Shapewear', h1='Snatched in every dress.', sub='Smooths the tummy and waist under bodycon, owambe and office wear. Breathable, no rolling down.', hs=60,
                          img='Hero · shapewear under dress', price='₦15,000', old='₦20,000', trust='Discreet packaging, nobody knows what is inside'))
    p.benefits('Why it works', [('Smooths in seconds', 'Flatter tummy the moment it is on.'), ('Stays put', 'Silicone grip, no rolling down.'), ('Breathes', 'Mesh panels for Lagos heat.')], 'statements')
    p.offer('Find your size', [('S · 6–8', 'Waist 26–28"'), ('M · 10–12', 'Waist 29–31"'), ('L · 14–16', 'Waist 32–35"'), ('XL · 18–20', 'Waist 36–39"'), ('2XL · 22', 'Waist 40–42"'), ('3XL · 24', 'Waist 43–46"')], 'grid')
    p.proof('Real customers', 'beforeafter')
    p.faq([('Can I wear it all day?', 'Yes, but take it off to sleep.'), ('Wrong size?', 'Free exchange within 5 days, unworn.'), ('Is delivery discreet?', 'Plain packaging, no labels.')])
    p.final('Wear the dress', 'Sizes M and L sell out first', 'accent')
    p.footer('Snatched', 'Abuja')
    p.buybar('Shapewear · M', '₦15,000', 'pill')
    return 'Snatched', 'Shapewear', 'TplSnatched', p

# 09 Men's grooming — rugged
def t09():
    t = dict(bg='#EFE8DF', surface='#F8F4EE', soft='#D9CBB9', line='#D3C4B1', ink='#1E1712', muted='#5A4A3D', accent='#7A4B2A', aink='#FFFFFF',
             hf="'Oswald', sans-serif", bf="'Inter', sans-serif", hw=600, ls='0.02em', r=4, br=4, upper=True,
             furl=F('Oswald:wght@500;600', 'Inter:wght@400;500;600;700'), method=wa(), opts=['#7A4B2A', '#2F3A2C', '#1E1712'])
    p = Page(t)
    p.header('GROOM CO.', 'Est. Lagos')
    p.hero('stack', dict(eyebrow='The complete beard kit', h1='A fuller, softer beard in 30 days.', sub='Beard oil, balm, wooden comb and boar-bristle brush in one gift box. No more itch, no more patchy look.',
                         img='Hero · kit laid out on wood', price='₦19,500', old='₦26,000', badge='KIT DEAL', trust='Free delivery in Lagos'))
    p.specs('What is in the box', [('Beard oil', '30 ml, argan + cedar'), ('Beard balm', '60 g, shea + beeswax'), ('Comb', 'Sandalwood'), ('Brush', 'Boar bristle'), ('Box', 'Gift-ready')])
    p.benefits('The routine', [('Morning', 'Three drops of oil, brush it through.'), ('Evening', 'Balm on the ends, comb into shape.'), ('Weekly', 'Wash with mild soap and repeat.')], 'numbered')
    p.offer('Choose a kit', [('Starter', 'Oil + comb', '₦9,500'), ('Complete kit', 'Everything in the box', '₦19,500', 'MOST BOUGHT'), ('Two kits', 'One for him, one gift', '₦36,000')], 'list')
    p.proof('From the guys', 'quotes', 2)
    p.faq([('Will it help patchy spots?', 'Daily oil and brushing helps fill the look over time.'), ('Does it smell strong?', 'A light cedar scent that fades in an hour.'), ('Good as a gift?', 'Yes, it comes boxed.')])
    p.final('Look after the beard', 'Ideal gift for him', 'dark')
    p.footer('Groom Co.', 'Victoria Island')
    p.buybar('Complete beard kit', '₦19,500', 'flat')
    return 'Rugged', "Men's grooming", 'TplRugged', p

# 10 Home decor — editorial terracotta
def t10():
    t = dict(bg='#F4EEE6', surface='#FBF8F3', soft='#E3D3C1', line='#DCCAB6', ink='#2B211B', muted='#5E5047', accent='#A64B24', aink='#FFFFFF',
             hf="'Gloock', serif", bf="'Manrope', sans-serif", hw=400, ls='-0.01em', r=2, br=2,
             furl=F('Gloock', 'Manrope:wght@400;500;600;700'), method=dict(type='dm', label='Order on Instagram', short='DM to order'), opts=['#A64B24', '#4F5B3A', '#2B211B'])
    p = Page(t)
    p.header('Nest Studio', 'Handmade in Lagos', 'center')
    p.hero('collage', dict(eyebrow='Throw pillows', h1='Make the sofa look like a magazine page.', sub='Hand-woven pillow covers in earthy colours. Sold in sets that are already styled for you.',
                           img='Hero · sofa styled with pillows', img2='Weave close-up', img3='Bedroom styling', price='₦28,000 / set of 4', trust='Inserts included · Washable covers'))
    p.offer('Choose a palette', [('Clay', 'Terracotta + cream'), ('Moss', 'Olive + sand'), ('Night', 'Charcoal + rust'), ('Sand', 'Beige + white')], 'grid', 0)
    p.problem('Styled, not random', ['Each set is a mix of sizes and textures that already go together, so you never end up with four pillows that clash.', 'Covers zip off for washing and the inserts stay full.'])
    p.gallery(['Living room', 'Reading corner', 'Bedroom', 'Balcony'], 'strip')
    p.proof('In your homes', 'rating', label='Customer home')
    p.faq([('What sizes are in a set?', 'Two 50×50 cm and two 45×45 cm.'), ('Can I buy single pillows?', 'Yes, ₦7,500 each.'), ('Delivery?', 'Lagos 1–2 days, nationwide 3–5 days.')])
    p.final('Your sofa, finished', 'New palettes every season', 'outline')
    p.footer('Nest Studio', 'Ikoyi')
    p.buybar('Clay set of 4', '₦28,000', 'flat')
    return 'Nest', 'Home decor', 'TplNest', p

# 11 Air fryer — clean orange
def t11():
    t = dict(bg='#FFFFFF', surface='#FFFFFF', soft='#FFE8D9', line='#EEE7E1', ink='#16181D', muted='#555A63', accent='#F26B1D', aink='#16181D', atext='#B44A0E',
             hf="'Plus Jakarta Sans', sans-serif", bf="'Plus Jakarta Sans', sans-serif", hw=800, ls='-0.03em', r=20, br=14,
             furl=F('Plus+Jakarta+Sans:wght@400;500;600;700;800'), method=dict(type='call', label='Call to order', short='Call to order'), opts=['#F26B1D', '#E6B800', '#3DBE8B'])
    p = Page(t)
    p.announce('Free delivery in Lagos and Abuja this week', 'soft')
    p.header('Crisp', 'Kitchen appliances')
    p.hero('stack', dict(eyebrow='6-litre air fryer', h1='Crunchy plantain and chicken with one spoon of oil.', sub='Fry, bake and grill without filling the kitchen with smoke or using a full bottle of oil.', hs=32,
                         img='Hero · air fryer with dodo', price='₦68,000', old='₦85,000', badge='-20%', trust='1-year warranty · Pay on delivery'))
    p.compare('Air fryer vs deep frying', 'Air fryer', 'Deep fry', [('Oil per meal', '1 spoon', 'Lots'), ('Smoke in kitchen', 'Very little', 'Plenty'), ('Clean-up', 'Basket only', 'Pot + oil'), ('Can bake', 'Yes', 'No')])
    p.specs('Specs', [('Capacity', '6 litres'), ('Power', '1500 W'), ('Temperature', '80–200 °C'), ('Presets', '8 (chips, chicken, fish…)'), ('Warranty', '12 months')])
    p.benefits('Cooks your favourites', [('Dodo', 'crispy edges, soft middle'), ('Chicken', 'golden skin, no splash burns'), ('Chips', 'from fresh potatoes'), ('Puff-puff', 'even reheated ones taste fresh')], 'cards')
    p.countdown('Promo price ends in')
    p.faq([('Is it big enough for a family?', '6 litres feeds 4–5 people.'), ('Will it work on generator?', 'Yes, on 3.5 kVA and above.'), ('Where is the warranty handled?', 'At our Lagos and Abuja service centres.')])
    p.final('Upgrade the kitchen', 'Only a few left at this price', 'dark')
    p.footer('Crisp Appliances', 'Ikeja')
    p.buybar('6L air fryer', '₦68,000', 'flat')
    return 'Crisp', 'Kitchen appliances', 'TplCrisp', p

# 12 Jewelry — minimal gold
def t12():
    t = dict(bg='#FBF8F2', surface='#FFFFFF', soft='#EFE6D6', line='#E8DECB', ink='#1C1A17', muted='#5E574C', accent='#8C6A2F', aink='#FFFFFF',
             hf="'Italiana', serif", bf="'Lato', sans-serif", hw=400, ls='0.04em', r=0, br=0, upper=True,
             furl=F('Italiana', 'Lato:wght@400;700'), method=wa(), opts=['#8C6A2F', '#6E6E6E', '#8A3B5C'])
    p = Page(t)
    p.announce('18k gold plated · Free gift box', 'ink')
    p.header('AURUM', 'Fine everyday jewellery', 'center')
    p.hero('centered', dict(eyebrow='The name necklace', h1='Your name in gold.', sub='Custom name necklace in 18k gold-plated stainless steel. Will not tarnish or turn your neck green.', hs=40,
                            img='Hero · name necklace on skin', price='₦16,000', old='₦21,000', trust='Made to order in 3 days'))
    p.offer('Choose finish', [('Gold', '₦16,000'), ('Rose gold', '₦16,000'), ('Silver', '₦14,000'), ('Two names', '₦24,000')], 'grid', 0)
    p.gallery(['Necklace close-up', 'Gift box', 'Worn with outfit', 'Name options'], 'grid')
    p.guarantee('12-month colour promise', 'If the plating fades within 12 months of normal wear, we replace it free.')
    p.proof('Worn by our customers', 'quotes', 2)
    p.faq([('How many letters?', 'Up to 10 letters at the same price.'), ('Can I shower with it?', 'Yes, stainless steel base.'), ('How long to make?', 'Ready in 3 days, then delivery.')])
    p.final('A gift that is all theirs', 'Order by Thursday for weekend delivery', 'dark')
    p.footer('Aurum', 'Lekki')
    p.buybar('Name necklace · Gold', '₦16,000', 'flat')
    return 'Aurum', 'Jewellery', 'TplAurum', p

# 13 Handbags — magazine B/W
def t13():
    t = dict(bg='#FFFFFF', surface='#FFFFFF', soft='#EDEDED', line='#E2E2E2', ink='#0A0A0A', muted='#555555', accent='#B3122E', aink='#FFFFFF',
             hf="'Bodoni Moda', serif", bf="'Inter', sans-serif", hw=700, ls='-0.02em', r=0, br=0,
             furl=F('Bodoni+Moda:wght@600;700', 'Inter:wght@400;500;600;700'), method=dict(type='dm', label='Order on Instagram', short='DM to order'), opts=['#B3122E', '#0A0A0A', '#1F4FD1'])
    p = Page(t)
    p.header('CARRY', 'Issue 07')
    p.hero('fullbleed', dict(eyebrow='The tote', h1='One bag. Office to dinner.', sub='Structured vegan-leather tote that fits a 15" laptop and still looks good at night.', hs=38,
                             img='Hero · editorial tote shot', price='₦42,000', trust='Free delivery · 7-day returns'))
    p.gallery(['Black', 'Tan', 'Wine', 'Ivory'], 'strip')
    p.specs('The details', [('Size', '38 × 29 × 14 cm'), ('Fits', '15" laptop + water bottle'), ('Material', 'Vegan leather, lined'), ('Straps', 'Handles + long strap'), ('Colours', 'Black, tan, wine, ivory')])
    p.benefits('Why it is the one', [('Holds its shape', 'Stiff base, never slouches.'), ('Inside pockets', 'Phone, keys and card slots.'), ('Wipe clean', 'Rain and dust come right off.')], 'statements')
    p.proof('Seen on', 'rating', label='Customer photo')
    p.final('Carry it everywhere', 'Wine colour is almost gone', 'outline')
    p.footer('Carry', 'Lagos')
    p.buybar('The tote · Black', '₦42,000', 'flat')
    return 'Editorial', 'Handbags', 'TplEditorial', p

# 14 Online course — creator purple
def t14():
    t = dict(bg='#F7F5FF', surface='#FFFFFF', soft='#E6DEFF', line='#E0D9F7', ink='#1A1530', muted='#565170', accent='#7A2EE5', aink='#FFFFFF',
             hf="'Sora', sans-serif", bf="'Inter', sans-serif", hw=700, ls='-0.03em', r=18, br=14,
             furl=F('Sora:wght@600;700', 'Inter:wght@400;500;600;700'), method=dict(type='pay', label='Pay ₦25,000 and start now', short='Enrol now'), opts=['#7A2EE5', '#1F6FD1', '#C2361F'])
    p = Page(t)
    p.announce('Next cohort starts Monday · [40] seats', 'ink')
    p.header('Sell on IG Academy', 'Online course')
    p.hero('centered', dict(eyebrow='4-week online course', h1='Get your first 50 sales from Instagram ads.', sub='Step-by-step videos, ad templates and a WhatsApp group with live Q&amp;A every week.',
                            img='Hero · course preview video', price='₦25,000', old='₦40,000', arch=False, trust='Lifetime access · Watch on your phone'))
    p.modules("What you'll learn", [('Pick a winning product', 'Week 1 · 6 lessons'), ('Make ads that stop the scroll', 'Week 2 · 8 lessons'), ('Run ads on a small budget', 'Week 3 · 7 lessons'), ('Close sales on WhatsApp', 'Week 4 · 5 lessons')])
    p.benefits("What's included", [('28 video lessons', 'short, phone-friendly'), ('Ad templates', 'copy and design files'), ('Weekly live Q&amp;A', 'on WhatsApp'), ('Certificate', 'when you finish')], 'checks')
    p.proof('Student wins', 'shots')
    p.guarantee('7-day refund', 'Watch the first week. If it is not for you, message us within 7 days for a full refund.')
    p.faq([('Do I need a big budget?', 'No. The course shows how to start with ₦5,000 a day.'), ('When do I get access?', 'Right after payment, by email and WhatsApp.'), ('Is it live or recorded?', 'Recorded lessons plus live weekly Q&amp;A.')])
    p.final('Your first 50 sales', 'Price goes up when the cohort fills', 'accent')
    p.footer('Sell on IG Academy', 'Online')
    p.buybar('4-week course', '₦25,000', 'pill')
    return 'Course', 'Online course', 'TplCourse', p

# 15 Makeup artist — blush services
def t15():
    t = dict(bg='#FFF6F2', surface='#FFFFFF', soft='#F7DCD3', line='#F0D6CC', ink='#2D1A1A', muted='#6A4E4E', accent='#A8475A', aink='#FFFFFF',
             hf="'Marcellus', serif", bf="'Karla', sans-serif", hw=400, ls='0.01em', r=28, br=999,
             furl=F('Marcellus', 'Karla:wght@400;500;600;700'), method=dict(type='dm', label='Book on Instagram', short='Book now'), opts=['#A8475A', '#7A4A3A', '#5B2A86'])
    p = Page(t)
    p.header('Glam by Ife', 'Makeup artist · Lagos', 'center')
    p.hero('collage', dict(eyebrow='Bridal &amp; owambe makeup', h1='Flawless from the first photo to the last dance.', sub='Soft glam that lasts 14 hours, photographs well and still looks like you.',
                           img='Hero · bride close-up', img2='Eye detail', img3='Owambe glam', price='From ₦45,000', trust='Home service across Lagos'))
    p.offer('Packages', [('Owambe glam', '₦45,000', ['Full face + lashes', 'Touch-up kit', '1.5 hrs']), ('Bridal', '₦180,000', ['Trial session', 'Wedding day glam', 'Second look for reception']), ('Photoshoot', '₦60,000', ['Two looks', 'On-set touch-ups'])], 'packages')
    p.steps('How booking works', ['Send your date, location and package', 'Pay a 50% deposit to hold the date', 'Glam day: we arrive 2 hours before'], 'timeline')
    p.gallery(['Bridal look', 'Soft glam', 'Gele and makeup', 'Before and after'], 'grid')
    p.proof('Brides and guests', 'quotes', 2)
    p.faq([('Do you travel?', 'Yes. Outside Lagos is quoted separately.'), ('Do you bring lashes?', 'Yes, premium lashes are included.'), ('How early should I book?', 'Bridal: 2–3 months. Owambe: 1–2 weeks.')])
    p.final('Lock in your date', 'December weekends are almost full', 'dark')
    p.footer('Glam by Ife', 'Lagos')
    p.buybar('Owambe glam', 'From ₦45,000', 'pill')
    return 'Glam', 'Makeup artist', 'TplGlam', p

# 16 Solar — energy
def t16():
    t = dict(bg='#F2F7F2', surface='#FFFFFF', soft='#D8E8DA', line='#CFE0D2', ink='#0F2416', muted='#46584B', accent='#F5B400', aink='#0F2416', atext='#1E6B3A',
             hf="'Barlow Condensed', sans-serif", bf="'Barlow', sans-serif", hw=700, ls='0', r=10, br=10, upper=True,
             furl=F('Barlow+Condensed:wght@600;700', 'Barlow:wght@400;500;600;700'), method=dict(type='call', label='Call an engineer', short='Call engineer'), opts=['#F5B400', '#3DBE8B', '#FF8A3D'])
    p = Page(t)
    p.announce('Free site survey in Lagos, Ibadan and Abuja', 'ink')
    p.header('SunPower', 'Solar &amp; inverters')
    p.hero('stack', dict(eyebrow='Home solar systems', h1='Say goodbye to fuel queues and generator noise.', sub='Solar panels, inverter and lithium battery, installed in one day by certified engineers.', hs=40,
                         img='Hero · panels on a Lagos roof', price='From ₦1,450,000', badge='Instalments available', trust='5-year battery warranty'))
    p.offer('Pick a system', [('3.5 kVA', '₦1,450,000', ['Lights, fans, TV, fridge', '4 panels + 5 kWh battery', 'About 8 hrs backup']), ('5 kVA', '₦2,400,000', ['Adds 1 AC unit', '8 panels + 10 kWh battery', 'Most popular for families']), ('10 kVA', '₦4,900,000', ['Whole house + 2 ACs', '16 panels + 15 kWh battery'])], 'packages')
    p.compare('Solar vs generator (per month)', 'Solar', 'Generator', [('Fuel cost', '₦0', '₦150k+'), ('Noise', 'Silent', 'Loud'), ('Servicing', 'Rare', 'Monthly'), ('Fumes', 'None', 'Yes')])
    p.steps('Install in 3 steps', ['Free survey of your home and appliances', 'Pick a system and payment plan', 'Installed and running in one day'], 'circles')
    p.guarantee('Warranty you can claim', 'Panels 25 years, inverter 2 years, battery 5 years. Claims handled by our own engineers.')
    p.faq([('Can I pay in instalments?', 'Yes, over 6–12 months for approved customers.'), ('What about rainy season?', 'Panels still charge on cloudy days; the battery covers the gap.'), ('Do you do flats?', 'Yes, with roof permission.')])
    p.final('Free survey this week', 'Engineers are booking fast', 'dark')
    p.footer('SunPower Solutions', 'Ibadan')
    p.buybar('5 kVA system', '₦2.4m', 'flat')
    return 'Solar', 'Solar & inverters', 'TplSolar', p

# 17 Car accessories — motorsport
def t17():
    t = dict(bg='#101114', surface='#17191D', soft='#22252B', line='#2C3038', ink='#F2F2F2', muted='#B0B3BA', accent='#D11F27', aink='#FFFFFF', atext='#FF5A60',
             dark='#F2F2F2', dink='#101114', hf="'Russo One', sans-serif", bf="'Inter', sans-serif", hw=400, ls='0', r=8, br=8, upper=True,
             furl=F('Russo+One', 'Inter:wght@400;500;600;700'), method=wa(), opts=['#D11F27', '#1F6FD1', '#E6B800'])
    p = Page(t)
    p.announce('Free installation in Lagos', 'accent')
    p.header('PIT LANE', 'Car accessories')
    p.hero('fullbleed', dict(eyebrow='Front + rear dashcam', h1='When it happens on the road, you have proof.', sub='4K front and 1080p rear camera with night vision. Records automatically when you start the car.', hs=30,
                             img='Hero · dashcam on windscreen at night', price='₦75,000', old='₦95,000', trust='Includes 64 GB card'))
    p.trust([('4K', 'front'), ('Night', 'vision'), ('24 hr', 'parking mode')], 'row')
    p.specs('Specs', [('Front camera', '4K, 150° wide'), ('Rear camera', '1080p'), ('Storage', '64 GB included, up to 256 GB'), ('Parking mode', 'Records bumps when parked'), ('App', 'Download clips to your phone')])
    p.benefits('Why drivers buy it', [('Settle disputes', 'Clear video for police and insurance.'), ('Stop fraud', 'Proof against staged accidents.'), ('Watch your car', 'Parking mode catches hit-and-runs.')], 'statements')
    p.countdown('Promo price ends in')
    p.proof('Drivers say', 'quotes', 2)
    p.faq([('Will it fit my car?', 'It fits any car with a windscreen.'), ('Who installs it?', 'Our technician, free in Lagos.'), ('Does it drain the battery?', 'No, it has low-voltage cut-off.')])
    p.final('Drive with proof', 'Free install ends this month', 'accent')
    p.footer('Pit Lane', 'Ikeja')
    p.buybar('4K dashcam kit', '₦75,000', 'pill')
    return 'Pitlane', 'Car accessories', 'TplPitlane', p

# 18 Modest fashion — sand & olive
def t18():
    t = dict(bg='#F3EEE6', surface='#FAF7F2', soft='#E2D8C8', line='#DDD2C0', ink='#24261E', muted='#5C5A4E', accent='#4F5B3A', aink='#FFFFFF',
             hf="'Amiri', serif", bf="'Mulish', sans-serif", hw=700, ls='0', r=18, br=999,
             furl=F('Amiri:wght@400;700', 'Mulish:wght@400;600;700'), method=wa(), opts=['#4F5B3A', '#7A4A3A', '#2F4858'])
    p = Page(t)
    p.announce('Free hijab with every abaya this week', 'ink')
    p.header('Noor', 'Modest wear · Kano · Lagos', 'center')
    p.hero('centered', dict(eyebrow='Everyday abaya', h1='Flowing, breathable and elegant all day.', sub='Soft crepe abaya that does not cling or crease. Made for work, jumat and family visits.',
                            img='Hero · abaya in motion', price='₦32,000', old='₦38,000', trust='Free hijab included'))
    p.offer('Colour and size', [('Sand · 52"', '₦32,000'), ('Olive · 54"', '₦32,000'), ('Black · 56"', '₦32,000'), ('Navy · 58"', '₦32,000')], 'grid', 0)
    p.gallery(['Sand abaya', 'Olive abaya', 'Fabric detail', 'Styled with hijab'], 'strip')
    p.benefits('Made for your day', [('Breathable crepe', 'stays cool in the heat'), ('No creases', 'wear it straight from your bag'), ('Hidden pockets', 'for phone and keys')], 'checks')
    p.proof('Sisters who wear it', 'quotes', 2)
    p.faq([('How do I choose length?', 'Your height in inches minus 6.'), ('Is it see-through?', 'No, it is fully opaque.'), ('Exchanges?', 'Free within 5 days, unworn.')])
    p.final('Your new favourite abaya', 'Sand and olive restock monthly', 'dark')
    p.footer('Noor Modest Wear', 'Kano')
    p.buybar('Sand abaya · 54"', '₦32,000', 'flat')
    return 'Noor', 'Modest fashion', 'TplNoor', p

# 19 Foodstuff — earthy bulk
def t19():
    t = dict(bg='#FFFDF5', surface='#FFFFFF', soft='#F1E6C8', line='#EADFC0', ink='#22200F', muted='#5B5640', accent='#2E6B30', aink='#FFFFFF',
             hf="'Rubik', sans-serif", bf="'Rubik', sans-serif", hw=700, ls='-0.02em', r=12, br=12,
             furl=F('Rubik:wght@400;500;600;700'), method=dict(type='form', label='Place my order', short='Order now'), opts=['#2E6B30', '#B44A0E', '#7A4B2A'])
    p = Page(t)
    p.announce('Delivery days: Tuesday and Saturday · Lagos and Ogun', 'accent')
    p.header('Farm Fresh', 'Straight from the farm')
    p.hero('collage', dict(eyebrow='Stock your kitchen', h1='Rice, beans and palm oil at farm prices.', sub='Stone-free local rice, honey beans and fresh red palm oil. Bought from farmers, delivered to your door.',
                           img='Hero · bags of rice and beans', img2='Palm oil gallon', img3='Farm photo', price='₦72,000 / 50kg rice', trust='Pay on delivery'))
    p.offer('Buy more, save more', [('1 bag', '₦72,000', '—'), ('3 bags', '₦69,000', '₦9,000'), ('5 bags', '₦67,000', '₦25,000'), ('10 bags', '₦65,000', '₦70,000')], 'tiers', 1)
    p.offer('Also available', [('Honey beans', '50 kg · ₦85,000'), ('Palm oil', '25 L · ₦48,000'), ('Garri (ijebu)', '50 kg · ₦38,000'), ('Kitchen bundle', 'Mixed · ₦120,000')], 'grid', 3)
    p.benefits('Why buy from us', [('Stone-free', 'machine-cleaned rice, no picking'), ('Fresh oil', 'pressed within the month'), ('Fair weight', 'weighed in front of you')], 'checks')
    p.steps('How to order', ['Fill the order form with items and address', 'We confirm on WhatsApp within an hour', 'Delivered Tuesday or Saturday, pay on arrival'], 'circles')
    p.faq([('Minimum order?', 'One bag or one gallon.'), ('Outside Lagos?', 'Ogun yes; other states on request.'), ('Can I mix items for the discount?', 'Yes, any 3 bags count.')])
    p.final('Fill the store this weekend', 'Prices are fixed until month end', 'dark')
    p.footer('Farm Fresh Foods', 'Mile 12, Lagos')
    p.buybar('3 bags of rice', '₦207,000', 'flat')
    return 'Harvest', 'Foodstuff & groceries', 'TplHarvest', p

# 20 Fitness coaching — energetic
def t20():
    t = dict(bg='#0B0F0D', surface='#121815', soft='#1B231F', line='#26302B', ink='#F1F5F2', muted='#A9B5AD', accent='#3DFF8B', aink='#0B0F0D',
             dark='#3DFF8B', dink='#0B0F0D', hf="'Bebas Neue', sans-serif", bf="'Inter', sans-serif", hw=400, ls='0.02em', r=12, br=10, upper=True,
             furl=F('Bebas+Neue', 'Inter:wght@400;500;600;700'), method=wa('Join on WhatsApp', 'Join now'), opts=['#3DFF8B', '#FFD60A', '#5CE1E6'])
    p = Page(t)
    p.hero('poster', dict(eyebrow='30-day home programme', h1='Shred 30. No gym needed.', sub='Daily 30-minute workouts, a Nigerian-food meal guide and a coach checking on you in a WhatsApp group.', hs=64,
                          img='Hero · coach training at home', price='₦20,000', old='₦30,000', trust='Starts every Monday'))
    p.trust([('30', 'min a day'), ('0', 'equipment'), ('1', 'coach')], 'row')
    p.modules('Your 30 days', [('Week 1 · Reset', 'Learn the moves, build the habit'), ('Week 2 · Build', 'Longer circuits, more reps'), ('Week 3 · Burn', 'Intervals and core'), ('Week 4 · Shred', 'Your strongest week')])
    p.benefits("What's included", [('Daily workout videos', 'follow along on your phone'), ('Meal guide', 'with jollof, swallow and all'), ('Coach check-ins', 'in the WhatsApp group'), ('Progress tracker', 'photos and measurements')], 'checks')
    p.proof('Transformations', 'beforeafter')
    p.faq([('Is it for beginners?', 'Yes, every move has an easier option.'), ('How long each day?', 'About 30 minutes.'), ('What if I miss a day?', 'Videos stay available; just continue.')])
    p.final('Start Monday', 'Group is capped at [50] people', 'accent')
    p.footer('Shred 30 Coaching', 'Online')
    p.buybar('Shred 30 programme', '₦20,000', 'pill')
    return 'Shred', 'Fitness coaching', 'TplShred', p

T = [t01, t02, t03, t04, t05, t06, t07, t08, t09, t10, t11, t12, t13, t14, t15, t16, t17, t18, t19, t20]
