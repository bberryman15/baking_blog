INSERT INTO baking_posts
  (name, date_made, image_url, recipe_source, recipe_type, tips, thoughts, flavors, enjoyment_rating, description)
VALUES
  (
    'Sunday Morning Croissants',
    '2026-09-14',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=85',
    'Claire Saffitz, Dessert Person — croissants',
    'Pastry',
    '["Keep the butter cool but pliable between folds.", "Give the dough a full overnight rest for deeper flavor."]'::jsonb,
    '["The kitchen smelled like a little Parisian bakery.", "The second batch had much more dramatic layers."]'::jsonb,
    '["buttery", "flaky", "golden"]'::jsonb,
    5,
    'A slow Saturday project that made the whole house smell incredible. Crisp, shatteringly flaky outside with a soft honeycomb middle.'
  ),
  (
    'Brown Butter Chocolate Chip Cookies',
    '2026-08-28',
    'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1000&q=85',
    'Tried and tweaked from the King Arthur Baking Company',
    'Cookies',
    '["Chill the dough overnight if you can wait.", "Pull them when the centers still look a little soft."]'::jsonb,
    '["A sprinkle of flaky salt made all the difference.", "Next time, make a double batch for the freezer."]'::jsonb,
    '["brown butter", "dark chocolate", "sea salt"]'::jsonb,
    5,
    'Chewy centers, crisp edges, and little pools of dark chocolate. Browning the butter adds a lovely toasted, almost toffee-like flavor.'
  ),
  (
    'Lemon & Olive Oil Loaf',
    '2026-07-19',
    'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=1000&q=85',
    'A family recipe, with a generous lemon glaze',
    'Cake',
    '["Rub the zest into the sugar before mixing.", "Let the loaf cool completely before glazing."]'::jsonb,
    '["The olive oil keeps this tender for days.", "A little rosemary could be lovely next time."]'::jsonb,
    '["bright lemon", "olive oil", "vanilla"]'::jsonb,
    4,
    'Sunny, tender, and just sweet enough. This easy loaf is the one I want on the counter with a pot of afternoon tea.'
  ),
  (
    'No-Knead Country Sourdough',
    '2026-06-02',
    'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&w=1000&q=85',
    'Notes from my sourdough starter experiments',
    'Bread',
    '["Watch the dough, not the clock, during bulk fermentation.", "Preheat the Dutch oven for at least 45 minutes."]'::jsonb,
    '["My starter was happiest after a warm afternoon feed.", "The crust sang as it cooled on the rack."]'::jsonb,
    '["tangy", "toasty crust", "open crumb"]'::jsonb,
    4,
    'A deeply golden crust with a pleasantly tangy crumb. It took a few tries to get the timing right, but this loaf was worth the wait.'
  ),
  (
    'Strawberry Hand Pies',
    '2026-05-11',
    'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?auto=format&fit=crop&w=1000&q=85',
    'Adapted from Smitten Kitchen',
    'Pie',
    '["Use a little cornstarch so the filling stays put.", "Crimp the edges firmly and cut a vent in each top."]'::jsonb,
    '["A mix of ripe and slightly tart berries worked best.", "They disappeared before they had fully cooled."]'::jsonb,
    '["strawberry", "buttery pastry", "lemon"]'::jsonb,
    4,
    'Little flaky parcels filled with jammy spring berries. A bit messy to shape, but wonderfully portable for a picnic.'
  ),
  (
    'Maple Pecan Morning Buns',
    '2026-04-06',
    'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=1000&q=85',
    'Weekend baking notes',
    'Pastry',
    '["Toast the pecans before adding them.", "Brush with maple syrup while the buns are still warm."]'::jsonb,
    '["The cinnamon sugar edges became beautifully caramelized.", "Best eaten warm, standing right by the oven."]'::jsonb,
    '["maple", "pecan", "cinnamon"]'::jsonb,
    5,
    'Soft, spiraled buns with crisp, sugared edges and a sticky maple-pecan center. The ideal excuse to invite friends over for coffee.'
  );
