var MOVES_RBY = {
	'(No Move)': {
		bp: 0,
		type: 'Normal',
		category: 'Physical'
	},
	'Acid': {
		bp: 40,
		type: 'Poison',
		category: 'Special'
	},
	'Agility': {
		bp: 0,
		type: 'Psychic'
	},
	'Amnesia': {
		bp: 0,
		type: 'Psychic'
	},
	'Aurora Beam': {
		bp: 65,
		type: 'Ice',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Barrier': {
		bp: 0,
		type: 'Psychic'
	},
	'Bind': {
		bp: 15,
		type: 'Normal'
	},
	'Blizzard': {
		bp: 120,
		type: 'Ice',
		category: 'Special',
		hasSecondaryEffect: true,
		isSpread: true
	},
	'Body Slam': {
		bp: 85,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Bone Club': {
		bp: 65,
		type: 'Ground',
		category: 'Physical',
		hasSecondaryEffect: true
	},
	'Bubble Beam': {
		bp: 65,
		type: 'Water',
		category: 'Special'
	},
	'Clamp': {
		bp: 35,
		type: 'Water'
	},
	'Crabhammer': {
		bp: 90,
		type: 'Water',
		category: 'Physical',
		makesContact: true,
		alwaysCrit: true
	},
	'Confuse Ray': {
		bp: 0,
		type: 'Ghost'
	},
	'Defense Curl': {
		bp: 0,
		type: 'Normal'
	},
	'Dig': {
		bp: 100,
		type: 'Ground',
		makesContact: true
	},
	'Disable': {
		bp: 0,
		type: 'Normal'
	},
	'Double Kick': {
		bp: 30,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		isTwoHit: true
	},
	'Double-Edge': {
		bp: 100,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		hasRecoil: 25
	},
	'Double Team': {
		bp: 0,
		type: 'Normal'
	},
	'Dream Eater': {
		bp: 100,
		type: 'Psychic',
		category: 'Special',
		givesHealth: true,
		percentHealed: 0.5
	},
	'Drill Peck': {
		bp: 80,
		type: 'Flying',
		category: 'Physical',
		makesContact: true
	},
	'Earthquake': {
		bp: 100,
		type: 'Ground',
		category: 'Physical',
		isSpread: true
	},
	'Explosion': {
		bp: 170,
		type: 'Normal',
		category: 'Physical',
		isSpread: true
	},
	'Fire Blast': {
		bp: 120,
		type: 'Fire',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Fire Punch': {
		bp: 75,
		type: 'Fire',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		isPunch: true
	},
	'Fire Spin': {
		bp: 15,
		type: 'Fire'
	},
	'Flamethrower': {
		bp: 95,
		type: 'Fire',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Fly': {
		bp: 70,
		type: 'Flying',
		category: 'Physical',
		makesContact: true
	},
	'Fury Swipes': {
		bp: 18,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		isMultiHit: true
	},
	'Glare': {
		bp: 0,
		type: 'Normal'
	},
	'Gust': {
		bp: 40,
		type: 'Normal',
		category: 'Special'
	},
	'Haze': {
		bp: 0,
		type: 'Ice'
	},
	'High Jump Kick': {
		bp: 85,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		hasRecoil: 'crash'
	},
	'Hydro Pump': {
		bp: 120,
		type: 'Water',
		category: 'Special'
	},
	'Hyper Beam': {
		bp: 150,
		type: 'Normal',
		category: 'Special'
	},
	'Hyper Fang': {
		bp: 80,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		isBite: true
	},
	'Ice Beam': {
		bp: 95,
		type: 'Ice',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Ice Punch': {
		bp: 75,
		type: 'Ice',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		isPunch: true
	},
	'Jump Kick': {
		bp: 70,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		hasRecoil: 'crash'
	},
	'Leech Life': {
		bp: 20,
		type: 'Bug',
		category: 'Physical',
		makesContact: true,
		givesHealth: true,
		percentHealed: 0.5
	},
	'Leech Seed': {
		bp: 0,
		type: 'Grass'
	},
	'Light Screen': {
		bp: 0,
		type: 'Psychic'
	},
	'Lovely Kiss': {
		bp: 0,
		type: 'Normal'
	},
	'Mega Drain': {
		bp: 40,
		type: 'Grass',
		givesHealth: true,
		percentHealed: 0.5
	},
	'Mirror Move': {
		bp: 0,
		type: 'Flying'
	},
	'Night Shade': {
		bp: 100,
		type: 'Ghost',
		category: 'Special'
	},
	'Pin Missile': {
		bp: 14,
		type: 'Bug',
		category: 'Physical',
		isMultiHit: true
	},
	'Psychic': {
		bp: 90,
		type: 'Psychic',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Quick Attack': {
		bp: 40,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		hasPriority: true
	},
	'Razor Leaf': {
		bp: 55,
		type: 'Grass',
		category: 'Physical',
		alwaysCrit: true
	},
	'Recover': {
		bp: 0,
		type: 'Normal'
	},
	'Reflect': {
		bp: 0,
		type: 'Psychic'
	},
	'Rest': {
		bp: 0,
		type: 'Psychic'
	},
	'Roar': {
		bp: 0,
		type: 'Normal'
	},
	'Rock Slide': {
		bp: 75,
		type: 'Rock',
		category: 'Physical',
		hasSecondaryEffect: true,
		isSpread: true
	},
	'Rock Throw': {
		bp: 50,
		type: 'Rock',
		category: 'Physical'
	},
	'Seismic Toss': {
		bp: 100,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true
	},
	'Self-Destruct': {
		bp: 130,
		type: 'Normal',
		category: 'Physical',
		isSpread: true
	},
	'Sing': {
		bp: 0,
		type: 'Normal'
	},
	'Sky Attack': {
		bp: 140,
		type: 'Flying',
		category: 'Physical',
		hasSecondaryEffect: true
	},
	'Skull Bash': {
		bp: 100,
		type: 'Normal',
		category: 'Physical',
		makesContact: true
	},
	'Slash': {
		bp: 70,
		type: 'Normal',
		alwaysCrit: true,
		makesContact: true
	},
	'Sludge': {
		bp: 65,
		type: 'Poison',
		category: 'Special'
	},
	'Soft-Boiled': {
		bp: 0,
		type: 'Normal'
	},
	'Spore': {
		bp: 0,
		type: 'Grass'
	},
	'Struggle': {
		bp: 50,
		type: 'Normal',
		hasRecoil: 50
	},
	'Submission': {
		bp: 80,
		type: 'Fighting',
		makesContact: true,
		hasRecoil: 25
	},
	'Substitute': {
		bp: 0,
		type: 'Normal'
	},
	'Super Fang': {
		bp: 0,
		type: 'Normal',
		makesContact: true
	},
	'Surf': {
		bp: 95,
		type: 'Water',
		category: 'Special',
		isSpread: true
	},
	'Swift': {
		bp: 60,
		type: 'Normal',
		category: 'Special',
		isSpread: true
	},
	'Swords Dance': {
		bp: 0,
		type: 'Normal'
	},
	'Tackle': {
		bp: 35,
		type: 'Normal',
		category: 'Physical',
		makesContact: true
	},
	'Take Down': {
		bp: 90,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		hasRecoil: 25
	},
	'Thrash': {
		bp: 90,
		type: 'Normal',
		category: 'Physical',
		makesContact: true
	},
	'Thunder': {
		bp: 120,
		type: 'Electric',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Thunderbolt': {
		bp: 95,
		type: 'Electric',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Thunder Punch': {
		bp: 75,
		type: 'Electric',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		isPunch: true
	},
	'Thunder Wave': {
		bp: 0,
		type: 'Electric'
	},
	'Toxic': {
		bp: 0,
		type: 'Poison'
	},
	'Tri Attack': {
		bp: 80,
		type: 'Normal',
		category: 'Special'
	},
	'Twineedle': {
		bp: 25,
		type: 'Bug',
		isTwoHit: true
	},
	'Waterfall': {
		bp: 80,
		type: 'Water',
		category: 'Physical',
		makesContact: true
	},
	'Water Gun': {
		bp: 40,
		type: 'Water',
		category: 'Special'
	},
	'Wing Attack': {
		bp: 35,
		type: 'Flying',
		category: 'Physical',
		makesContact: true
	},
	'Wrap': {
		bp: 15,
		type: 'Normal'
	},
	'Whirlwind': {
		bp: 0,
		type: 'Normal'
	}
};

var MOVES_GSC = $.extend(true, {}, MOVES_RBY, {
	'Aeroblast': {
		bp: 100,
		type: 'Flying',
		category: 'Special'
	},
	'Ancient Power': {
		bp: 60,
		type: 'Rock',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Baton Pass': {
		bp: 0,
		type: 'Normal'
	},
	'Belly Drum': {
		bp: 0,
		type: 'Normal'
	},
	'Bite': {
		bp: 60,
		type: 'Dark',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		isBite: true
	},
	'Bone Rush': {
		bp: 25,
		type: 'Ground',
		category: 'Physical',
		isMultiHit: true
	},
	'Crabhammer': {alwaysCrit: false},
	'Cross Chop': {
		bp: 100,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true
	},
	'Crunch': {
		bp: 80,
		type: 'Dark',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		isBite: true
	},
	'Curse': {
		bp: 0,
		type: 'Ghost'
	},
	'Destiny Bond': {
		bp: 0,
		type: 'Ghost'
	},
	'Dig': {bp: 60},
	'Double-Edge': {bp: 120},
	'Dynamic Punch': {
		bp: 100,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		isPunch: true
	},
	'Encore': {
		bp: 0,
		type: 'Normal'
	},
	'Endure': {
		bp: 0,
		type: 'Normal'
	},
	'Explosion': {bp: 250},
	'Extreme Speed': {
		bp: 80,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		hasPriority: true
	},
	'Feint Attack': {
		bp: 60,
		type: 'Dark',
		category: 'Physical',
		makesContact: true
	},
	'Flail': {
		bp: 1,
		type: 'Normal',
		category: 'Physical',
		makesContact: true
	},
	'Flame Wheel': {
		bp: 60,
		type: 'Fire',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Frustration': {
		bp: 102,
		type: 'Normal',
		category: 'Physical',
		makesContact: true
	},
	'Future Sight': {
		bp: 80,
		type: 'Psychic',
		category: 'Special'
	},
	'Giga Drain': {
		bp: 60,
		type: 'Grass',
		category: 'Special',
		givesHealth: true,
		percentHealed: 0.5
	},
	'Gust': {type: 'Flying'},
	'Headbutt': {
		bp: 70,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Heal Bell': {
		bp: 0,
		type: 'Normal'
	},
	'Hidden Power Bug': {
		bp: 70,
		type: 'Bug',
		category: 'Special'
	},
	'Hidden Power Dark': {
		bp: 70,
		type: 'Dark',
		category: 'Special'
	},
	'Hidden Power Dragon': {
		bp: 70,
		type: 'Dragon',
		category: 'Special'
	},
	'Hidden Power Electric': {
		bp: 70,
		type: 'Electric',
		category: 'Special'
	},
	'Hidden Power Fighting': {
		bp: 70,
		type: 'Fighting',
		category: 'Special'
	},
	'Hidden Power Fire': {
		bp: 70,
		type: 'Fire',
		category: 'Special'
	},
	'Hidden Power Flying': {
		bp: 70,
		type: 'Flying',
		category: 'Special'
	},
	'Hidden Power Ghost': {
		bp: 70,
		type: 'Ghost',
		category: 'Special'
	},
	'Hidden Power Grass': {
		bp: 70,
		type: 'Grass',
		category: 'Special'
	},
	'Hidden Power Ground': {
		bp: 70,
		type: 'Ground',
		category: 'Special'
	},
	'Hidden Power Ice': {
		bp: 70,
		type: 'Ice',
		category: 'Special'
	},
	'Hidden Power Poison': {
		bp: 70,
		type: 'Poison',
		category: 'Special'
	},
	'Hidden Power Psychic': {
		bp: 70,
		type: 'Psychic',
		category: 'Special'
	},
	'Hidden Power Rock': {
		bp: 70,
		type: 'Rock',
		category: 'Special'
	},
	'Hidden Power Steel': {
		bp: 70,
		type: 'Steel',
		category: 'Special'
	},
	'Hidden Power Water': {
		bp: 70,
		type: 'Water',
		category: 'Special'
	},
	'Icy Wind': {
		bp: 55,
		type: 'Ice',
		category: 'Special',
		hasSecondaryEffect: true,
		isSpread: true
	},
	'Iron Tail': {
		bp: 100,
		type: 'Steel',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Mach Punch': {
		bp: 40,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		isPunch: true,
		hasPriority: true
	},
	'Megahorn': {
		bp: 120,
		type: 'Bug',
		category: 'Physical',
		makesContact: true
	},
	'Metal Claw': {
		bp: 50,
		type: 'Steel',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Milk Drink': {
		bp: 0,
		type: 'Normal'
	},
	'Moonlight': {
		bp: 0,
		type: 'Normal'
	},
	'Protect': {
		bp: 0,
		type: 'Normal'
	},
	'Pursuit': {
		bp: 40,
		type: 'Dark',
		category: 'Physical',
		makesContact: true
	},
	'Rapid Spin': {
		bp: 20,
		type: 'Normal',
		category: 'Physical',
		makesContact: true
	},
	'Razor Leaf': {alwaysCrit: false},
	'Return': {
		bp: 102,
		type: 'Normal',
		category: 'Physical',
		makesContact: true
	},
	'Reversal': {
		bp: 1,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true
	},
	'Rock Smash': {
		bp: 20,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Sacred Fire': {
		bp: 100,
		type: 'Fire',
		category: 'Physical',
		hasSecondaryEffect: true
	},
	'Self-Destruct': {bp: 200},
	'Shadow Ball': {
		bp: 80,
		type: 'Ghost',
		category: 'Special',
		hasSecondaryEffect: true,
		isBullet: true
	},
	'Slash': {alwaysCrit: false},
	'Sleep Talk': {
		bp: 0,
		type: 'Normal'
	},
	'Sludge Bomb': {
		bp: 90,
		type: 'Poison',
		category: 'Special',
		hasSecondaryEffect: true,
		isBullet: true
	},
	'Solar Beam': {
		bp: 120,
		type: 'Grass',
		category: 'Special'
	},
	'Spark': {
		bp: 65,
		type: 'Electric',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Spikes': {
		bp: 0,
		type: 'Ground'
	},
	'Steel Wing': {
		bp: 70,
		type: 'Steel',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Struggle': {type: 'None', hasRecoil: 25},
	'Sunny Day': {
		bp: 0,
		type: 'Fire'
	},
	'Swagger': {
		bp: 0,
		type: 'Normal'
	},
	'Synthesis': {
		bp: 0,
		type: 'Grass'
	},
	'Thief': {
		bp: 40,
		type: 'Dark',
		category: 'Physical',
		makesContact: true
	},
	'Tri Attack': {hasSecondaryEffect: true},
	'Whirlpool': {
		bp: 15,
		type: 'Water',
		category: 'Special'
	},
	'Wing Attack': {bp: 60},
	'Zap Cannon': {
		bp: 100,
		type: 'Electric',
		category: 'Special',
		hasSecondaryEffect: true,
		isBullet: true
	}
});

delete MOVES_GSC['Acid'];
delete MOVES_GSC['Mega Drain'];

var MOVES_ADV = $.extend(true, {}, MOVES_GSC, {
	'Aerial Ace': {
		bp: 60,
		type: 'Flying',
		category: 'Physical',
		makesContact: true
	},
	'Air Cutter': {
		bp: 55,
		type: 'Flying',
		category: 'Special',
		isSpread: true
	},
	'Astonish': {
		bp: 30,
		type: 'Ghost',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Aromatherapy': {
		bp: 0,
		type: 'Grass'
	},
	'Blast Burn': {
		bp: 150,
		type: 'Fire',
		category: 'Special'
	},
	'Blaze Kick': {
		bp: 85,
		type: 'Fire',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Bonemerang': {
		bp: 50,
		type: 'Ground',
		category: 'Physical',
		isTwoHit: true
	},
	'Bounce': {
		bp: 85,
		type: 'Flying',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Brick Break': {
		bp: 75,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true
	},
	'Bulk Up': {
		bp: 0,
		type: 'Fighting'
	},
	'Bullet Seed': {
		bp: 10,
		type: 'Grass',
		category: 'Physical',
		isMultiHit: true,
		isBullet: true
	},
	'Calm Mind': {
		bp: 0,
		type: 'Psychic'
	},
	'Covet': {
		bp: 40,
		type: 'Normal',
		category: 'Physical',
		makesContact: true
	},
	'Crush Claw': {
		bp: 75,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Dive': {
		bp: 60,
		type: 'Water',
		category: 'Physical',
		makesContact: true
	},
	'Doom Desire': {
		bp: 120,
		type: 'Steel',
		category: 'Special'
	},
	'Dragon Claw': {
		bp: 80,
		type: 'Dragon',
		category: 'Physical',
		makesContact: true
	},
	'Double-Edge': {hasRecoil: 33},
	'Endeavor': {
		bp: 1,
		type: 'Normal',
		category: 'Physical',
		makesContact: true
	},
	'Eruption': {
		bp: 150,
		type: 'Fire',
		category: 'Special',
		isSpread: true
	},
	'Extrasensory': {
		bp: 80,
		type: 'Psychic',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Facade': {
		bp: 70,
		type: 'Normal',
		category: 'Physical',
		makesContact: true
	},
	'Fake Out': {
		bp: 40,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		hasPriority: true
	},
	'Focus Punch': {
		bp: 150,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		isPunch: true
	},
	'Frenzy Plant': {
		bp: 150,
		type: 'Grass',
		category: 'Special'
	},
	'Heat Wave': {
		bp: 100,
		type: 'Fire',
		category: 'Special',
		hasSecondaryEffect: true,
		isSpread: true
	},
	'Helping Hand': {
		bp: 0,
		type: 'Normal'
	},
	'Hydro Cannon': {
		bp: 150,
		type: 'Water',
		category: 'Special'
	},
	'Hyper Voice': {
		bp: 90,
		type: 'Normal',
		category: 'Special',
		isSound: true,
		isSpread: true
	},
	'Icicle Spear': {
		bp: 10,
		type: 'Ice',
		category: 'Physical',
		isMultiHit: true
	},
	'Ingrain': {
		bp: 0,
		type: 'Grass'
	},
	'Iron Defense': {
		bp: 0,
		type: 'Steel'
	},
	'Knock Off': {
		bp: 20,
		type: 'Dark',
		category: 'Physical',
		makesContact: true
	},
	'Leaf Blade': {
		bp: 70,
		type: 'Grass',
		category: 'Physical',
		makesContact: true
	},
	'Luster Purge': {
		bp: 70,
		type: 'Psychic',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Low Kick': {
		bp: 1,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true
	},
	'Magical Leaf': {
		bp: 60,
		type: 'Grass',
		category: 'Special'
	},
	'Magic Coat': {
		bp: 0,
		type: 'Psychic'
	},
	'Meteor Mash': {
		bp: 100,
		type: 'Steel',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		isPunch: true
	},
	'Mist Ball': {
		bp: 70,
		type: 'Psychic',
		category: 'Special',
		hasSecondaryEffect: true,
		isBullet: true
	},
	'Mud Shot': {
		bp: 55,
		type: 'Ground',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Muddy Water': {
		bp: 95,
		type: 'Water',
		category: 'Special',
		hasSecondaryEffect: true,
		isSpread: true
	},
	'Needle Arm': {
		bp: 60,
		type: 'Grass',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Overheat': {
		bp: 140,
		type: 'Fire',
		category: 'Special',
		dropsStats: 2
	},
	'Poison Fang': {
		bp: 50,
		type: 'Poison',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		isBite: true
	},
	'Poison Tail': {
		bp: 50,
		type: 'Poison',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Psycho Boost': {
		bp: 140,
		type: 'Psychic',
		category: 'Special',
		dropsStats: 2
	},
	'Recycle': {
		bp: 0,
		type: 'Normal'
	},
	'Refresh': {
		bp: 0,
		type: 'Normal'
	},
	'Revenge': {
		bp: 120,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true
	},
	'Rock Blast': {
		bp: 25,
		type: 'Rock',
		category: 'Physical',
		isMultiHit: true
	},
	'Rock Tomb': {
		bp: 50,
		type: 'Rock',
		category: 'Physical',
		hasSecondaryEffect: true
	},
	'Sand Tomb': {
		bp: 15,
		type: 'Ground',
		category: 'Physical'
	},
	'Secret Power': {
		bp: 70,
		type: 'Normal',
		category: 'Physical',
		hasSecondaryEffect: true
	},
	'Shadow Punch': {
		bp: 60,
		type: 'Ghost',
		category: 'Physical',
		makesContact: true,
		isPunch: true
	},
	'Sheer Cold': {
		bp: 1,
		type: 'Ice',
		category: 'Special'
	},
	'Shock Wave': {
		bp: 60,
		type: 'Electric',
		category: 'Special'
	},
	'Signal Beam': {
		bp: 75,
		type: 'Bug',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Silver Wind': {
		bp: 60,
		type: 'Bug',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Sky Uppercut': {
		bp: 85,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		isPunch: true
	},
	'Slack Off': {
		bp: 0,
		type: 'Normal'
	},
	'Stockpile': {
		bp: 0,
		type: 'Normal'
	},
	'Superpower': {
		bp: 120,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		dropsStats: 1
	},
	'Tail Glow': {
		bp: 0,
		type: 'Bug'
	},
	'Taunt': {
		bp: 0,
		type: 'Dark'
	},
	'Trick': {
		bp: 0,
		type: 'Psychic'
	},
	'Uproar': {
		bp: 50,
		type: 'Normal',
		category: 'Special'
	},
	'Volt Tackle': {
		bp: 120,
		type: 'Electric',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		hasRecoil: 33
	},
	'Water Pulse': {
		bp: 60,
		type: 'Water',
		category: 'Special',
		hasSecondaryEffect: true,
		isPulse: true
	},
	'Water Spout': {
		bp: 150,
		type: 'Water',
		category: 'Special',
		isSpread: true
	},
	'Weather Ball': {
		bp: 50,
		type: 'Normal',
		category: 'Special',
		isBullet: true
	},
	'Will-O-Wisp': {
		bp: 0,
		type: 'Fire'
	},
	'Wish': {
		bp: 0,
		type: 'Normal'
	},
	'Yawn': {
		bp: 0,
		type: 'Normal'
	}
});

var MOVES_DPP = $.extend(true, {}, MOVES_ADV, {
	'Air Slash': {
		bp: 75,
		type: 'Flying',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Aqua Jet': {
		bp: 40,
		type: 'Water',
		category: 'Physical',
		makesContact: true,
		hasPriority: true
	},
	'Aqua Tail': {
		bp: 90,
		type: 'Water',
		category: 'Physical',
		makesContact: true
	},
	'Aqua Ring': {
		bp: 0,
		type: 'Water'
	},
	'Assurance': {
		bp: 50,
		type: 'Dark',
		category: 'Physical',
		makesContact: true
	},
	'Attack Order': {
		bp: 90,
		type: 'Bug',
		category: 'Physical'
	},
	'Aura Sphere': {
		bp: 90,
		type: 'Fighting',
		category: 'Special',
		isBullet: true,
		isPulse: true
	},
	'Avalanche': {
		bp: 120,
		type: 'Ice',
		category: 'Physical',
		makesContact: true
	},
	'Brave Bird': {
		bp: 120,
		type: 'Flying',
		category: 'Physical',
		makesContact: true,
		hasRecoil: 33
	},
	'Brine': {
		bp: 65,
		type: 'Water',
		category: 'Special'
	},
	'Bug Bite': {
		bp: 60,
		type: 'Bug',
		category: 'Physical',
		makesContact: true
	},
	'Bug Buzz': {
		bp: 90,
		type: 'Bug',
		category: 'Special',
		hasSecondaryEffect: true,
		isSound: true
	},
	'Bullet Punch': {
		bp: 40,
		type: 'Steel',
		category: 'Physical',
		makesContact: true,
		isPunch: true,
		hasPriority: true
	},
	'Charge Beam': {
		bp: 50,
		type: 'Electric',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Chatter': {
		bp: 60,
		type: 'Flying',
		category: 'Special',
		hasSecondaryEffect: true,
		isSound: true
	},
	'Close Combat': {
		bp: 120,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true
	},
	'Covet': {bp: 60},
	'Cross Poison': {
		bp: 70,
		type: 'Poison',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Dark Pulse': {
		bp: 80,
		type: 'Dark',
		category: 'Special',
		hasSecondaryEffect: true,
		isPulse: true
	},
	'Dark Void': {
		bp: 0,
		type: 'Dark'
	},
	'Defend Order': {
		bp: 0,
		type: 'Bug'
	},
	'Defog': {
		bp: 0,
		type: 'Flying'
	},
	'Dig': {bp: 80},
	'Discharge': {
		bp: 80,
		type: 'Electric',
		category: 'Special',
		hasSecondaryEffect: true,
		isSpread: true
	},
	'Dive': {bp: 80},
	'Double Hit': {
		bp: 35,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		isTwoHit: true
	},
	'Draco Meteor': {
		bp: 140,
		type: 'Dragon',
		category: 'Special',
		dropsStats: 2
	},
	'Dragon Pulse': {
		bp: 90,
		type: 'Dragon',
		category: 'Special',
		isPulse: true
	},
	'Dragon Rush': {
		bp: 100,
		type: 'Dragon',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Drain Punch': {
		bp: 60,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		isPunch: true,
		givesHealth: true,
		percentHealed: 0.5
	},
	'Earth Power': {
		bp: 90,
		type: 'Ground',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Energy Ball': {
		bp: 80,
		type: 'Grass',
		category: 'Special',
		hasSecondaryEffect: true,
		isBullet: true
	},
	'Feint': {
		bp: 50,
		type: 'Normal',
		category: 'Physical',
		bypassesProtect: true
	},
	'Fire Fang': {
		bp: 65,
		type: 'Fire',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		isBite: true
	},
	'Flare Blitz': {
		bp: 120,
		type: 'Fire',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		hasRecoil: 33
	},
	'Flash Cannon': {
		bp: 80,
		type: 'Steel',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Fling': {
		bp: 1,
		type: 'Dark',
		category: 'Physical'
	},
	'Fly': {bp: 90},
	'Focus Blast': {
		bp: 120,
		type: 'Fighting',
		category: 'Special',
		hasSecondaryEffect: true,
		isBullet: true
	},
	'Force Palm': {
		bp: 60,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Giga Impact': {
		bp: 150,
		type: 'Normal',
		category: 'Physical',
		makesContact: true
	},
	'Grass Knot': {
		bp: 1,
		type: 'Grass',
		category: 'Special',
		makesContact: true
	},
	'Gunk Shot': {
		bp: 120,
		type: 'Poison',
		category: 'Physical',
		hasSecondaryEffect: true
	},
	'Gyro Ball': {
		bp: 1,
		type: 'Steel',
		category: 'Physical',
		makesContact: true,
		isBullet: true
	},
	'Hammer Arm': {
		bp: 100,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		isPunch: true
	},
	'Head Smash': {
		bp: 150,
		type: 'Rock',
		category: 'Physical',
		makesContact: true,
		hasRecoil: 50
	},
	'Heal Order': {
		bp: 0,
		type: 'Bug'
	},
	'Healing Wish': {
		bp: 0,
		type: 'Psychic'
	},
	'High Jump Kick': {bp: 100},
	'Ice Fang': {
		bp: 65,
		type: 'Ice',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		isBite: true
	},
	'Ice Shard': {
		bp: 40,
		type: 'Ice',
		category: 'Physical',
		hasPriority: true
	},
	'Iron Head': {
		bp: 80,
		type: 'Steel',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Judgment': {
		bp: 100,
		type: 'Normal',
		category: 'Special'
	},
	'Jump Kick': {bp: 85},
	'Last Resort': {
		bp: 130,
		type: 'Normal',
		category: 'Physical',
		makesContact: true
	},
	'Lava Plume': {
		bp: 80,
		type: 'Fire',
		category: 'Special',
		hasSecondaryEffect: true,
		isSpread: true
	},
	'Leaf Blade': {bp: 90},
	'Leaf Storm': {
		bp: 140,
		type: 'Grass',
		category: 'Special',
		dropsStats : 2
	},
	'Lunar Dance': {
		bp: 0,
		type: 'Psychic'
	},
	'Magma Storm': {
		bp: 120,
		type: 'Fire',
		category: 'Special'
	},
	'Magnet Bomb': {
		bp: 60,
		type: 'Steel',
		category: 'Physical',
		isBullet: true
	},
	'Magnet Rise': {
		bp: 0,
		type: 'Electric'
	},
	'Me First': {
		bp: 0,
		type: 'Normal'
	},
	'Mirror Shot': {
		bp: 65,
		type: 'Steel',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Mud Bomb': {
		bp: 65,
		type: 'Ground',
		category: 'Special',
		isBullet: true,
		hasSecondaryEffect: true
	},
	'Natural Gift': {
		bp: 1,
		type: 'Normal',
		category: 'Physical'
	},
	'Nature Power': {
		bp: 80,
		type: 'Normal',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Nasty Plot': {
		bp: 0,
		type: 'Dark'
	},
	'Night Slash': {
		bp: 70,
		type: 'Dark',
		category: 'Physical',
		makesContact: true
	},
	'Ominous Wind': {
		bp: 60,
		type: 'Ghost',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Outrage': {
		bp: 120,
		type: 'Dragon',
		category: 'Physical',
		makesContact: true
	},
	'Paleo Wave': {
		bp: 85,
		type: 'Rock',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Payback': {
		bp: 50,
		type: 'Dark',
		category: 'Physical',
		makesContact: true
	},
	'Pluck': {
		bp: 60,
		type: 'Flying',
		category: 'Physical',
		makesContact: true
	},
	'Poison Jab': {
		bp: 80,
		type: 'Poison',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Power Gem': {
		bp: 70,
		type: 'Rock',
		category: 'Special'
	},
	'Power Whip': {
		bp: 120,
		type: 'Grass',
		category: 'Physical',
		makesContact: true
	},
	'Psycho Cut': {
		bp: 70,
		type: 'Psychic',
		category: 'Physical'
	},
	'Psycho Shift': {
		bp: 0,
		type: 'Psychic'
	},
	'Punishment': {
		bp: 60,
		type: 'Dark',
		category: 'Physical',
		makesContact: true
	},
	'Roar of Time': {
		bp: 150,
		type: 'Dragon',
		category: 'Special'
	},
	'Rock Climb': {
		bp: 90,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Rock Smash': {bp: 40},
	'Rock Polish': {
		bp: 0,
		type: 'Rock'
	},
	'Rock Wrecker': {
		bp: 150,
		type: 'Rock',
		category: 'Physical',
		isBullet: true
	},
	'Roost': {
		bp: 0,
		type: 'Flying'
	},
	'Seed Bomb': {
		bp: 80,
		type: 'Grass',
		category: 'Physical',
		isBullet: true
	},
	'Seed Flare': {
		bp: 120,
		type: 'Grass',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Shadow Claw': {
		bp: 70,
		type: 'Ghost',
		category: 'Physical',
		makesContact: true
	},
	'Shadow Force': {
		bp: 120,
		type: 'Ghost',
		category: 'Physical',
		makesContact: true,
		bypassesProtect: true
	},
	'Shadow Sneak': {
		bp: 40,
		type: 'Ghost',
		category: 'Physical',
		makesContact: true,
		hasPriority: true
	},
	'Shadow Strike': {
		bp: 80,
		type: 'Ghost',
		category: 'Physical',
		hasSecondaryEffect: true,
		makesContact: true
	},
	'Spacial Rend': {
		bp: 100,
		type: 'Dragon',
		category: 'Special'
	},
	'Stealth Rock': {
		bp: 0,
		type: 'Rock'
	},
	'Stone Edge': {
		bp: 100,
		type: 'Rock',
		category: 'Physical'
	},
	'Struggle': {hasRecoil: 'Struggle'},
	'Sucker Punch': {
		bp: 80,
		type: 'Dark',
		category: 'Physical',
		makesContact: true,
		hasPriority: true
	},
	'Switcheroo': {
		bp: 0,
		type: 'Dark'
	},
	'Tailwind': {
		bp: 0,
		type: 'Flying'
	},
	'Thunder Fang': {
		bp: 65,
		type: 'Electric',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		isBite: true
	},
	'Toxic Spikes': {
		bp: 0,
		type: 'Poison'
	},
	'Trick Room': {
		bp: 0,
		type: 'Psychic'
	},
	'U-turn': {
		bp: 70,
		type: 'Bug',
		category: 'Physical',
		makesContact: true
	},
	'Vacuum Wave': {
		bp: 40,
		type: 'Fighting',
		category: 'Special',
		hasPriority: true
	},
	'Wake-Up Slap': {
		bp: 60,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true
	},
	'Waterfall': {hasSecondaryEffect: true},
	'Wood Hammer': {
		bp: 120,
		type: 'Grass',
		category: 'Physical',
		makesContact: true,
		hasRecoil: 33
	},
	'Wring Out': {
		bp: 1,
		type: 'Normal',
		category: 'Special',
		makesContact: true
	},
	'X-Scissor': {
		bp: 80,
		type: 'Bug',
		category: 'Physical',
		makesContact: true
	},
	'Zap Cannon': {bp: 120},
	'Zen Headbutt': {
		bp: 80,
		type: 'Psychic',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	}
});

var MOVES_BW = $.extend(true, {}, MOVES_DPP, {
	'Acid Spray': {
		bp: 40,
		type: 'Poison',
		category: 'Special',
		hasSecondaryEffect: true,
		isBullet: true
	},
	'Acrobatics': {
		bp: 55,
		type: 'Flying',
		category: 'Physical',
		makesContact: true
	},
	'Autotomize': {
		bp: 0,
		type: 'Steel'
	},
	'Blue Flare': {
		bp: 130,
		type: 'Fire',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Bolt Strike': {
		bp: 130,
		type: 'Electric',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Bulldoze': {
		bp: 60,
		type: 'Ground',
		category: 'Physical',
		hasSecondaryEffect: true,
		isSpread: true
	},
	'Bullet Seed': {bp: 25},
	'Chip Away': {
		bp: 70,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		ignoresDefenseBoosts: true
	},
	'Circle Throw': {
		bp: 60,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true
	},
	'Clear Smog': {
		bp: 50,
		type: 'Poison',
		category: 'Special'
	},
	'Coil': {
		bp: 0,
		type: 'Poison'
	},
	'Cotton Guard': {
		bp: 0,
		type: 'Grass'
	},
	'Doom Desire': {bp: 140},
	'Dragon Tail': {
		bp: 60,
		type: 'Dragon',
		category: 'Physical',
		makesContact: true
	},
	'Drain Punch': {bp: 75},
	'Drill Run': {
		bp: 80,
		type: 'Ground',
		category: 'Physical',
		makesContact: true
	},
	'Dual Chop': {
		bp: 40,
		type: 'Dragon',
		category: 'Physical',
		makesContact: true,
		isTwoHit: true
	},
	'Electro Ball': {
		bp: 1,
		type: 'Electric',
		category: 'Special',
		isBullet: true
	},
	'Electroweb': {
		bp: 55,
		type: 'Electric',
		category: 'Special',
		hasSecondaryEffect: true,
		isSpread: true
	},
	'Feint': {bp: 30},
	'Fiery Dance': {
		bp: 80,
		type: 'Fire',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Final Gambit': {
		bp: 1,
		type: 'Fighting',
		category: 'Special'
	},
	'Fire Pledge': {
		bp: 50,
		type: 'Fire',
		category: 'Special'
	},
	'Fire Pledge (Grass Pledge Boosted)': {
		bp: 150,
		type: 'Fire',
		category: 'Special'
	},
	'Fire Pledge (Water Pledge Boosted)': {
		bp: 150,
		type: 'Fire',
		category: 'Special'
	},
	'Flame Burst': {
		bp: 70,
		type: 'Fire',
		category: 'Special'
	},
	'Flame Charge': {
		bp: 50,
		type: 'Fire',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Foul Play': {
		bp: 95,
		type: 'Dark',
		category: 'Physical',
		makesContact: true
	},
	'Freeze Shock': {
		bp: 140,
		type: 'Ice',
		category: 'Physical',
		hasSecondaryEffect: true
	},
	'Frost Breath': {
		bp: 40,
		type: 'Ice',
		category: 'Special',
		alwaysCrit: true
	},
	'Fusion Bolt': {
		bp: 100,
		type: 'Electric',
		category: 'Physical'
	},
	'Fusion Flare': {
		bp: 100,
		type: 'Fire',
		category: 'Special'
	},
	'Future Sight': {bp: 100},
	'Gear Grind': {
		bp: 50,
		type: 'Steel',
		category: 'Physical',
		isTwoHit: true,
		makesContact: true
	},
	'Giga Drain': {bp: 75},
	'Glaciate': {
		bp: 65,
		type: 'Ice',
		category: 'Special',
		hasSecondaryEffect: true,
		isSpread: true
	},
	'Grass Pledge': {
		bp: 50,
		type: 'Grass',
		category: 'Special'
	},
	'Grass Pledge (Fire Pledge Boosted)': {
		bp: 150,
		type: 'Grass',
		category: 'Special'
	},
	'Grass Pledge (Water Pledge Boosted)': {
		bp: 150,
		type: 'Grass',
		category: 'Special'
	},
	'Heal Pulse': {
		bp: 0,
		type: 'Psychic'
	},
	'Heart Stamp': {
		bp: 60,
		type: 'Psychic',
		category: 'Physical',
		hasSecondaryEffect: true,
		makesContact: true
	},
	'Head Charge': {
		bp: 120,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		hasRecoil: 25
	},
	'Heavy Slam': {
		bp: 1,
		type: 'Steel',
		category: 'Physical',
		makesContact: true
	},
	'Hex': {
		bp: 50,
		type: 'Ghost',
		category: 'Special'
	},
	'High Jump Kick': {bp: 130},
	'Hone Claws': {
		bp: 0,
		type: 'Dark'
	},
	'Horn Leech': {
		bp: 75,
		type: 'Grass',
		category: 'Physical',
		makesContact: true,
		givesHealth: true,
		percentHealed: 0.5
	},
	'Hurricane': {
		bp: 120,
		type: 'Flying',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Ice Burn': {
		bp: 140,
		type: 'Ice',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Icicle Crash': {
		bp: 85,
		type: 'Ice',
		category: 'Physical',
		hasSecondaryEffect: true
	},
	'Icicle Spear': {bp: 25},
	'Incinerate': {
		bp: 30,
		type: 'Fire',
		category: 'Special',
		isSpread: true
	},
	'Inferno': {
		bp: 100,
		type: 'Fire',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Jump Kick': {bp: 100},
	'Last Resort': {bp: 140},
	'Leaf Tornado': {
		bp: 65,
		type: 'Grass',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Low Sweep': {
		bp: 60,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Night Daze': {
		bp: 85,
		type: 'Dark',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Petal Dance': {
		bp: 120,
		type: 'Grass',
		category: 'Special',
		makesContact: true
	},
	'Psyshock': {
		bp: 80,
		type: 'Psychic',
		category: 'Special',
		dealsPhysicalDamage: true
	},
	'Psystrike': {
		bp: 100,
		type: 'Psychic',
		category: 'Special',
		dealsPhysicalDamage: true
	},
	'Quick Guard': {
		bp: 0,
		type: 'Fighting'
	},
	'Quiver Dance': {
		bp: 0,
		type: 'Bug'
	},
	'Rage Powder': {
		bp: 0,
		type: 'Bug'
	},
	'Razor Shell': {
		bp: 75,
		type: 'Water',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Relic Song': {
		bp: 75,
		type: 'Normal',
		category: 'Special',
		hasSecondaryEffect: true,
		isSound: true,
		isSpread: true
	},
	'Retaliate': {
		bp: 70,
		type: 'Normal',
		category: 'Physical',
		makesContact: true
	},
	'Round': {
		bp: 60,
		type: 'Normal',
		category: 'Special'
	},
	'Sacred Sword': {
		bp: 90,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		ignoresDefenseBoosts: true
	},
	'Sand Tomb': {bp: 35},
	'Scald': {
		bp: 80,
		type: 'Water',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Searing Shot': {
		bp: 100,
		type: 'Fire',
		category: 'Special',
		hasSecondaryEffect: true,
		isSpread: true,
		isBullet: true
	},
	'Secret Sword': {
		bp: 85,
		type: 'Fighting',
		category: 'Special',
		dealsPhysicalDamage: true
	},
	'Shell Smash': {
		bp: 0,
		type: 'Normal'
	},
	'Shift Gear': {
		bp: 0,
		type: 'Steel'
	},
	'Sky Drop': {
		bp: 60,
		type: 'Flying',
		category: 'Physical',
		makesContact: true
	},
	'Sludge Wave': {
		bp: 95,
		type: 'Poison',
		category: 'Special',
		hasSecondaryEffect: true,
		isSpread: true
	},
	'Smack Down': {
		bp: 50,
		type: 'Rock',
		category: 'Physical'
	},
	'Snarl': {
		bp: 55,
		type: 'Dark',
		category: 'Special',
		hasSecondaryEffect: true,
		isSound: true,
		isSpread: true
	},
	'Steamroller': {
		bp: 65,
		type: 'Bug',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Stored Power': {
		bp: 20,
		type: 'Psychic',
		category: 'Special'
	},
	'Storm Throw': {
		bp: 40,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		alwaysCrit: true
	},
	'Struggle Bug': {
		bp: 30,
		type: 'Bug',
		category: 'Special',
		isSpread: true
	},
	'Synchronoise': {
		bp: 70,
		type: 'Psychic',
		category: 'Special'
	},
	'Tackle': {bp: 50},
	'Tail Slap': {
		bp: 25,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		isMultiHit: true
	},
	'Techno Blast': {
		bp: 85,
		type: 'Normal',
		category: 'Special'
	},
	'Thrash': {bp: 120},
	'Uproar': {bp: 90},
	'V-create': {
		bp: 180,
		type: 'Fire',
		category: 'Physical',
		makesContact: true
	},
	'Venoshock': {
		bp: 65,
		type: 'Poison',
		category: 'Special'
	},
	'Volt Switch': {
		bp: 70,
		type: 'Electric',
		category: 'Special'
	},
	'Water Pledge': {
		bp: 50,
		type: 'Water',
		category: 'Special'
	},
	'Water Pledge (Fire Pledge Boosted)': {
		bp: 150,
		type: 'Water',
		category: 'Special'
	},
	'Water Pledge (Grass Pledge Boosted)': {
		bp: 150,
		type: 'Water',
		category: 'Special'
	},
	'Whirlpool': {bp: 35},
	'Wide Guard': {
		bp: 0,
		type: 'Rock'
	},
	'Wild Charge': {
		bp: 90,
		type: 'Electric',
		category: 'Physical',
		makesContact: true,
		hasRecoil: 25
	}
});

var MOVES_XY = $.extend(true, {}, MOVES_BW, {
	'Air Cutter': {bp: 60},
	'Arm Thrust': {
		bp: 15,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		isMultiHit: true
	},
	'Assurance': {bp: 60},
	'Aura Sphere': {bp: 80},
	'Belch': {
		bp: 120,
		type: 'Poison',
		category: 'Special'
	},
	'Blizzard': {bp: 110},
	'Boomburst': {
		bp: 140,
		type: 'Normal',
		category: 'Special',
		isSound: true,
		isSpread: true
	},
	'Chatter': {bp: 65},
	'Crabhammer': {bp: 100},
	'Dazzling Gleam': {
		bp: 80,
		type: 'Fairy',
		category: 'Special',
		isSpread: true
	},
	'Diamond Storm': {
		bp: 100,
		type: 'Rock',
		category: 'Physical',
		hasSecondaryEffect: true,
		isSpread: true
	},
	'Disarming Voice': {
		bp: 40,
		type: 'Fairy',
		isSound: true
	},
	'Draco Meteor': {bp: 130},
	'Dragon Ascent': {
		bp: 120,
		type: 'Flying',
		category: 'Physical',
		makesContact: true
	},
	'Dragon Pulse': {bp: 85},
	'Draining Kiss': {
		bp: 50,
		type: 'Fairy',
		category: 'Special',
		makesContact: true,
		givesHealth: true,
		percentHealed: 0.75
	},
	'Energy Ball': {bp: 90},
	'Facade': {ignoresBurn: true},
	'Fell Stinger': {
		bp: 30,
		type: 'Bug',
		category: 'Physical',
		makesContact: true
	},
	'Fire Blast': {bp: 110},
	'Fire Pledge': {bp: 80},
	'Flamethrower': {bp: 90},
	'Flying Press': {
		bp: 80,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true
	},
	'Freeze-Dry': {
		bp: 70,
		type: 'Ice',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Frost Breath': {bp: 60},
	'Future Sight': {bp: 120},
	'Geomancy': {
		bp: 0,
		type: 'Fairy'
	},
	'Grass Pledge': {bp: 80},
	'Heat Wave': {bp: 95},
	'Hex': {bp: 65},
	'Hidden Power Bug': {bp: 60},
	'Hidden Power Dark': {bp: 60},
	'Hidden Power Dragon': {bp: 60},
	'Hidden Power Electric': {bp: 60},
	'Hidden Power Fighting': {bp: 60},
	'Hidden Power Fire': {bp: 60},
	'Hidden Power Flying': {bp: 60},
	'Hidden Power Ghost': {bp: 60},
	'Hidden Power Grass': {bp: 60},
	'Hidden Power Ground': {bp: 60},
	'Hidden Power Ice': {bp: 60},
	'Hidden Power Poison': {bp: 60},
	'Hidden Power Psychic': {bp: 60},
	'Hidden Power Rock': {bp: 60},
	'Hidden Power Steel': {bp: 60},
	'Hidden Power Water': {bp: 60},
	'Hurricane': {bp: 110},
	'Hydro Pump': {bp: 110},
	'Hyperspace Fury': {
		bp: 100,
		type: 'Dark',
		category: 'Physical',
		bypassesProtect: true
	},
	'Hyperspace Hole': {
		bp: 80,
		type: 'Psychic',
		category: 'Special',
		bypassesProtect: true
	},
	'Ice Beam': {bp: 90},
	'Incinerate': {bp: 60},
	'Infestation': {
		bp: 20,
		type: 'Bug',
		category: 'Special',
		makesContact: true
	},
	'King\'s Shield': {
		bp: 0,
		type: 'Steel'
	},
	'Knock Off': {bp: 65},
	'Land\'s Wrath': {
		bp: 90,
		type: 'Ground',
		category: 'Physical',
		isSpread: true
	},
	'Leaf Storm': {bp: 130},
	'Light of Ruin': {
		bp: 140,
		type: 'Fairy',
		category: 'Special',
		hasRecoil: 50
	},
	'Low Sweep': {bp: 65},
	'Magma Storm': {bp: 100},
	'Meteor Mash': {bp: 90},
	'Moonblast': {
		bp: 95,
		type: 'Fairy',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Moonlight': {type: 'Fairy'},
	'Muddy Water': {bp: 90},
	'Mystical Fire': {
		bp: 65,
		type: 'Fire',
		category: 'Special',
		hasSecondaryEffect: true
	},
	'Nuzzle': {
		bp: 20,
		type: 'Electric',
		category: 'Physical',
		hasSecondaryEffect: true,
		makesContact: true
	},
	'Oblivion Wing': {
		bp: 80,
		type: 'Flying',
		category: 'Special',
		givesHealth: true,
		percentHealed: 0.75
	},
	'Origin Pulse': {
		bp: 110,
		type: 'Water',
		category: 'Special',
		isSpread: true,
		isPulse: true
	},
	'Overheat': {bp: 130},
	'Parabolic Charge': {
		bp: 50,
		type: 'Electric',
		category: 'Special',
		givesHealth: true,
		percentHealed: 0.5
	},
	'Phantom Force': {
		bp: 90,
		type: 'Ghost',
		category: 'Physical',
		makesContact: true,
		bypassesProtect: true
	},
	'Pin Missile': {bp: 25},
	'Play Rough': {
		bp: 90,
		type: 'Fairy',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true
	},
	'Power Gem': {bp: 80},
	'Power-Up Punch': {
		bp: 40,
		type: 'Fighting',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		isPunch: true
	},
	'Precipice Blades': {
		bp: 120,
		type: 'Ground',
		category: 'Physical',
		isSpread: 'true'
	},
	'Rock Tomb': {bp: 60},
	'Skull Bash': {bp: 130},
	'Spiky Shield': {
		bp: 0,
		type: 'Grass'
	},
	'Steam Eruption': {
		bp: 110,
		type: 'Water',
		category: 'Special',
		hasSecondaryEffect: true,
	},
	'Sticky Web': {
		bp: 0,
		type: 'Bug'
	},
	'Storm Throw': {bp: 60},
	'Struggle Bug': {bp: 50},
	'Surf': {bp: 90},
	'Synchronoise': {bp: 120},
	'Techno Blast': {bp: 120},
	'Thief': {bp: 60},
	'Thousand Arrows': {
		bp: 90,
		type: 'Ground',
		category: 'Physical',
		isSpread: 'true'
	},
	'Thousand Waves': {
		bp: 90,
		type: 'Ground',
		category: 'Physical',
		isSpread: 'true'
	},
	'Thunder': {bp: 110},
	'Thunderbolt': {bp: 90},
	'Wake-Up Slap': {bp: 70},
	'Water Pledge': {bp: 80},
	'Water Shuriken': {
		bp: 15,
		type: 'Water',
		category: 'Physical',
		isMultiHit: true
	}
});

var ZMOVES_TYPING = {
	'Bug': 'Savage Spin-Out',
	'Dark': 'Black Hole Eclipse',
	'Dragon': 'Devastating Drake',
	'Electric': 'Gigavolt Havoc',
	'Fairy': 'Twinkle Tackle',
	'Fighting': 'All-Out Pummeling',
	'Fire': 'Inferno Overdrive',
	'Flying': 'Supersonic Skystrike',
	'Ghost': 'Never-Ending Nightmare',
	'Grass': 'Bloom Doom',
	'Ground': 'Tectonic Rage',
	'Ice': 'Subzero Slammer',
	'Normal': 'Breakneck Blitz',
	'Poison': 'Acid Downpour',
	'Psychic': 'Shattered Psyche',
	'Rock': 'Continental Crush',
	'Steel': 'Corkscrew Crash',
	'Water': 'Hydro Vortex'
};

var MOVES_SM = $.extend(true, {}, MOVES_XY, {
	'10,000,000 Volt Thunderbolt': {
		bp: 195,
		type: 'Electric',
		category: 'Special',
		isZ: true
	},
	'Acid Downpour': {
		bp: 1,
		type: 'Poison',
		category: 'Physical',
		isZ: true
	},
	'Acid Spray': {zp: 100},
	'Accelerock': {
		bp: 40,
		type: 'Rock',
		category: 'Physical',
		makesContact: true,
		hasPriority: true,
		zp: 100
	},
	'Acrobatics': {zp: 100},
	'Aerial Ace': {zp: 120},
	'Aeroblast': {zp: 180},
	'Air Cutter': {zp: 120},
	'Air Slash': {zp: 140},
	'All-Out Pummeling': {
		bp: 1,
		type: 'Fighting',
		category: 'Physical',
		isZ: true
	},
	'Anchor Shot': {
		bp: 80,
		type: 'Steel',
		category: 'Physical',
		makesContact: true,
		hasSecondaryEffect: true,
		zp: 160
	},
	'Ancient Power': {zp: 120},
	'Aqua Jet': {zp: 100},
	'Aqua Tail': {zp: 175},
	'Arm Thrust': {zp: 100},
	'Assurance': {zp: 120},
	'Astonish': {zp: 100},
	'Attack Order': {zp: 175},
	'Aura Sphere': {zp: 160},
	'Aurora Beam': {zp: 120},
	'Avalanche': {zp: 120},
	'Beak Blast': {
		bp: 100,
		type: 'Flying',
		category: 'Physical',
		zp: 180,
		isBullet: true
	},
	'Belch': {zp: 190},
	'Bite': {zp: 120},
	'Black Hole Eclipse': {
		bp: 1,
		type: 'Dark',
		category: 'Physical',
		isZ: true
	},
	'Blast Burn': {zp: 200},
	'Blaze Kick': {zp: 160},
	'Blizzard': {zp: 185},
	'Bloom Doom': {
		bp: 1,
		type: 'Grass',
		category: 'Physical',
		isZ: true
	},
	'Blue Flare': {zp: 195},
	'Brave Bird': {zp: 190},
	'Breakneck Blitz': {
		bp: 1,
		type: 'Normal',
		category: 'Physical',
		isZ: true
	},
	'Brine': {zp: 120},
	'Body Slam': {zp: 160},
	'Bolt Strike': {zp: 195},
	'Bone Club': {zp: 120},
	'Bone Rush': {zp: 140},
	'Bonemerang': {zp: 100},
	'Boomburst': {zp: 200},
	'Bounce': {zp: 160},
	'Brick Break': {zp: 140},
	'Brutal Swing': {
		bp: 60,
		type: 'Dark',
		category: 'Physical',
		makesContact: true,
		isSpread: true,
		zp: 120
	},
	'Bubble Beam': {zp: 120},
	'Bug Bite': {zp: 120},
	'Bug Buzz': {zp: 175},
	'Bulldoze': {zp: 120},
	'Bullet Punch': {zp: 100},
	'Bullet Seed': {zp: 140},
	'Burn Up': {
		bp: 130,
		type: 'Fire',
		category: 'Special',
		zp: 195
	},
	'Catastropika': {
		bp: 210,
		type: 'Electric',
		category: 'Physical',
		isZ: true,
		makesContact: true
	},
	'Charge Beam': {zp: 100},
	'Chatter': {zp: 120},
	'Chip Away': {zp: 140},
	'Circle Throw': {zp: 120},
	'Clanging Scales': {
		bp: 110,
		type: 'Dragon',
		category: 'Special',
		isSound: true,
		isSpread: true,
		zp: 185
	},
	'Clangorous Soulblaze': {
		bp: 185,
		type: 'Dragon',
		category: 'Special',
		isSound: true,
		isSpread: true,
		isZ: true
	},
	'Clear Smog': {zp: 100},
	'Close Combat': {zp: 190},
	'Continental Crush': {
		bp: 1,
		type: 'Rock',
		category: 'Physical',
		isZ: true
	},
	'Core Enforcer': {
		bp: 100,
		type: 'Dragon',
		category: 'Special',
		isSpread: true,
		zp: 140
	},
	'Corkscrew Crash': {
		bp: 1,
		type: 'Steel',
		category: 'Physical',
		isZ: true
	},
	'Covet': {zp: 120},
	'Crabhammer': {zp: 180},
	'Cross Chop': {zp: 180},
	'Cross Poison': {zp: 140},
	'Crunch': {zp: 160},
	'Crush Claw': {zp: 140},
	'Dark Pulse': {zp: 160},
	'Darkest Lariat': {
		bp: 85,
		type: 'Dark',
		category: 'Physical',
		makesContact: true,
		zp: 160
	},
	'Dazzling Gleam': {zp: 160},
	'Diamond Storm': {zp: 180},
	'Dig': {zp: 160},
	'Discharge': {zp: 160},
	'Dive': {zp: 160},
	'Dragon Hammer': {
		bp: 90,
		type: 'Dragon',
		category: 'Physical',
		makesContact: true,
		zp: 175
	},
	'Draining Kiss': {zp: 100},
	'Drill Peck': {zp: 160},
	'Devastating Drake': {
		bp: 1,
		type: 'Dragon',
		category: 'Physical',
		isZ: true
	},
	'Doom Desire': {zp: 200},
	'Double-Edge': {zp: 190},
	'Double Hit': {zp: 140},
	'Double Kick': {zp: 100},
	'Draco Meteor': {zp: 195},
	'Dragon Ascent': {zp: 190},
	'Dragon Claw': {zp: 160},
	'Dragon Pulse': {zp: 160},
	'Dragon Rush': {zp: 180},
	'Dragon Tail': {zp: 120},
	'Drain Punch': {zp: 140},
	'Dream Eater': {zp: 180},
	'Drill Run': {zp: 160},
	'Dual Chop': {zp: 100},
	'Dynamic Punch': {zp: 180},
	'Earth Power': {zp: 175},
	'Earthquake': {zp: 180},
	'Electro Ball': {zp: 160},
	'Electroweb': {zp: 100},
	'Endeavor': {zp: 160},
	'Energy Ball': {zp: 175},
	'Eruption': {zp: 200},
	'Explosion': {zp: 200},
	'Extrasensory': {zp: 160},
	'Extreme Speed': {zp: 160},
	'Fake Out': {zp: 100},
	'Facade': {zp: 140},
	'Feint': {zp: 100},
	'Feint Attack': {zp: 120},
	'Fell Stinger': {bp: '50', zp: 100},
	'Fiery Dance': {zp: 160},
	'Final Gambit': {zp: 180},
	'Fire Blast': {zp: 185},
	'Fire Fang': {zp: 120},
	'Fire Lash': {
		bp: 80,
		type: 'Fire',
		category: 'Physical',
		hasSecondaryEffect: true,
		makesContact: true,
		zp: 160
	},
	'Fire Pledge': {zp: 160},
	'Fire Punch': {zp: 140},
	'First Impression': {
		bp: 90,
		type: 'Bug',
		category: 'Physical',
		makesContact: true,
		hasPriority: true,
		zp: 175
	},
	'Flail': {zp: 160},
	'Flamethrower': {zp: 175},
	'Flame Burst': {zp: 140},
	'Flame Charge': {zp: 100},
	'Flame Wheel': {zp: 120},
	'Flare Blitz': {zp: 190},
	'Flash Cannon': {zp: 160},
	'Fleur Cannon': {
		bp: 130,
		type: 'Fairy',
		category: 'Special',
		hasSecondaryEffect: true,
		zp: 195,
		dropsStats: 2
	},
	'Fling': {zp: 100},
	'Fly': {zp: 175},
	'Flying Press': {bp: 100, zp: 170},
	'Focus Blast': {zp: 190},
	'Focus Punch': {zp: 200},
	'Force Palm': {zp: 120},
	'Foul Play': {zp: 175},
	'Freeze Shock': {zp: 200},
	'Freeze-Dry': {zp: 140},
	'Frenzy Plant': {zp: 200},
	'Frost Breath': {zp: 120},
	'Frustration': {zp: 160},
	'Fury Swipes': {zp: 100},
	'Fusion Bolt': {zp: 180},
	'Fusion Flare': {zp: 180},
	'Future Sight': {zp: 190},
	'Gear Grind': {zp: 180},
	'Genesis Supernova': {
		bp: 185,
		type: 'Psychic',
		category: 'Special',
		isZ: true
	},
	'Giga Drain': {zp: 140},
	'Giga Impact': {zp: 200},
	'Gigavolt Havoc': {
		bp: 1,
		type: 'Electric',
		category: 'Physical',
		isZ: true
	},
	'Glaciate': {zp: 120},
	'Grass Knot': {zp: 160},
	'Grass Pledge': {zp: 160},
	'Gunk Shot': {zp: 190},
	'Gust': {zp: 100},
	'Guardian of Alola' : {
		bp: 1,
		type: 'Fairy',
		category: 'Special',
		isZ: true
	},
	'Gyro Ball': {zp: 160},
	'Hammer Arm': {zp: 180},
	'Headbutt': {zp: 140},
	'Head Charge': {zp: 190},
	'Head Smash': {zp: 200},
	'Heart Stamp': {zp: 120},
	'Heat Wave': {zp: 175},
	'Heavy Slam': {zp: 160},
	'Hex': {zp: 160},
	'Hidden Power Bug': {zp: 120},
	'Hidden Power Dark': {zp: 120},
	'Hidden Power Dragon': {zp: 120},
	'Hidden Power Electric': {zp: 120},
	'Hidden Power Fighting': {zp: 120},
	'Hidden Power Fire': {zp: 120},
	'Hidden Power Flying': {zp: 120},
	'Hidden Power Ghost': {zp: 120},
	'Hidden Power Grass': {zp: 120},
	'Hidden Power Ground': {zp: 120},
	'Hidden Power Ice': {zp: 120},
	'Hidden Power Poison': {zp: 120},
	'Hidden Power Psychic': {zp: 120},
	'Hidden Power Rock': {zp: 120},
	'Hidden Power Steel': {zp: 120},
	'Hidden Power Water': {zp: 120},
	'High Horsepower': {
		bp: 95,
		type: 'Ground',
		category: 'Physical',
		makesContact: true,
		zp: 175
	},
	'High Jump Kick': {zp: 195},
	'Horn Leech': {zp: 140},
	'Hurricane': {zp: 185},
	'Hydro Cannon': {zp: 200},
	'Hydro Pump': {zp: 185},
	'Hydro Vortex': {
		bp: 1,
		type: 'Water',
		category: 'Physical',
		isZ: true
	},
	'Hyper Beam': {zp: 200},
	'Hyper Voice': {zp: 175},
	'Hyperspace Fury': {zp: 180},
	'Hyperspace Hole': {zp: 160},
	'Ice Beam': {zp: 175},
	'Ice Burn': {zp: 200},
	'Ice Fang': {zp: 120},
	'Ice Hammer': {
		bp: 100,
		type: 'Ice',
		category: 'Physical',
		makesContact: true,
		isPunch: true,
		zp: 180
	},
	'Ice Punch': {zp: 140},
	'Ice Shard': {zp: 100},
	'Icicle Crash': {zp: 160},
	'Icicle Spear': {zp: 140},
	'Icy Wind': {zp: 100},
	'Incinerate': {zp: 120},
	'Inferno': {zp: 180},
	'Inferno Overdrive': {
		bp: 1,
		type: 'Fire',
		category: 'Physical',
		isZ: true
	},
	'Infestation': {zp: 100},
	'Iron Head': {zp: 160},
	'Iron Tail': {zp: 180},
	'Judgment': {zp: 180},
	'Jump Kick': {zp: 180},
	'Knock Off': {zp: 120},
	'Land\'s Wrath': {zp: 185},
	'Last Resort': {zp: 200},
	'Lava Plume': {zp: 160},
	'Leafage': {
		bp: 40,
		type: 'Grass',
		category: 'Physical',
		zp: 100
	},
	'Leaf Blade': {zp: 175},
	'Leaf Storm': {zp: 195},
	'Leaf Tornado': {zp: 120},
	'Leech Life': {bp: 80, zp: 160},
	'Let\'s Snuggle Forever': {
		bp: 190,
		type: 'Fairy',
		category: 'Physical',
		makesContact: true,
		isZ: true
	},
	'Light of Ruin': {zp: 200},
	'Light That Burns the Sky': {
		bp: 200,
		type: 'Psychic',
		category: 'Special',
		usesHighestAttackStat: true,
		isZ: true
	},
	'Liquidation': {
		bp: 85,
		type: 'Water',
		category: 'Physical',
		hasSecondaryEffect: true,
		makesContact: true,
		zp: 160
	},
	'Low Kick': {zp: 160},
	'Low Sweep': {zp: 120},
	'Lunge': {
		bp: 80,
		type: 'Bug',
		category: 'Physical',
		hasSecondaryEffect: true,
		makesContact: true,
		zp: 160
	},
	'Luster Purge': {zp: 140},
	'Mach Punch': {zp: 100},
	'Magical Leaf': {zp: 120},
	'Magma Storm': {zp: 180},
	'Magnet Bomb': {zp: 120},
	'Malicious Moonsault': {
		bp: 180,
		type: 'Dark',
		category: 'Physical',
		makesContact: true,
		isZ: true
	},
	'Megahorn': {zp: 190},
	'Menacing Moonraze Maelstrom': {
		bp: 200,
		type: 'Ghost',
		category: 'Special',
		isZ: true
	},
	'Metal Claw': {zp: 100},
	'Meteor Mash': {zp: 175},
	'Mind Blown': {
		bp: 150,
		type: 'Fire',
		category: 'Special',
		isSpread: true,
		hasRecoil: true,
		zp: 200
	},
	'Mirror Shot': {zp: 120},
	'Mist Ball': {zp: 140},
	'Moonblast': {zp: 175},
	'Moongeist Beam': {
		bp: 100,
		type: 'Ghost',
		category: 'Special',
		zp: 180
	},
	'Muddy Water': {zp: 175},
	'Mud Bomb': {zp: 120},
	'Mud Shot': {zp: 100},
	'Multi-Attack': {
		bp: 90,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		zp: 185
	},
	'Mystical Fire': {bp: 75, zp: 140},
	'Natural Gift': {zp: 160},
	'Nature\'s Madness' : {
		bp: 1,
		type: 'Fairy',
		category: 'Special',
		zp: 100
	},
	'Needle Arm': {zp: 120},
	'Never-Ending Nightmare': {
		bp: 1,
		type: 'Ghost',
		category: 'Physical',
		isZ: true
	},
	'Night Daze': {zp: 160},
	'Night Shade': {zp: 100},
	'Night Slash': {zp: 140},
	'Nuzzle': {zp: 100},
	'Oblivion Wing': {zp: 160},
	'Oceanic Operetta': {
		bp: 195,
		type: 'Water',
		category: 'Special',
		isZ: true
	},
	'Ominous Wind': {zp: 120},
	'Origin Pulse': {zp: 185},
	'Outrage': {zp: 190},
	'Overheat': {zp: 195},
	'Paleo Wave': {zp: 160},
	'Parabolic Charge': {bp: 65, zp: 120},
	'Payback': {zp: 100},
	'Petal Dance': {zp: 190},
	'Phantom Force': {zp: 175},
	'Photon Geyser': {
		bp: 100,
		type: 'Psychic',
		category: 'Special',
		usesHighestAttackStat: true,
		zp: 180
	},
	'Pin Missile': {zp: 140},
	'Plasma Fists': {
		bp: 100,
		type: 'Electric',
		category: 'Physical',
		makesContact: true,
		isPunch: true,
		zp: 180
	},
	'Play Rough': {zp: 175},
	'Pluck': {zp: 120},
	'Poison Fang': {zp: 100},
	'Poison Jab': {zp: 160},
	'Poison Tail': {zp: 100},
	'Pollen Puff': {
		bp: 90,
		type: 'Bug',
		category: 'Special',
		isBullet: true,
		zp: 175
	},
	'Power Gem': {zp: 160},
	'Power Trip': {
		bp: 20,
		type: 'Dark',
		category: 'Physical',
		makesContact: true,
		zp: 160
	},
	'Power Whip': {zp: 190},
	'Power-Up Punch': {zp: 100},
	'Prismatic Laser': {
		bp: 160,
		type: 'Psychic',
		category: 'Special',
		zp: 200
	},
	'Precipice Blades': {zp: 190},
	'Psychic': {zp: 175},
	'Psychic Fangs': {
		bp: 85,
		type: 'Psychic',
		category: 'Physical',
		makesContact: true,
		isBite: true,
		zp: 160
	},
	'Psycho Boost': {zp: 200},
	'Psycho Cut': {zp: 140},
	'Psyshock': {zp: 160},
	'Psystrike': {zp: 180},
	'Pulverizing Pancake': {
		bp: 210,
		type: 'Normal',
		category: 'Physical',
		makesContact: true,
		isZ: true
	},
	'Punishment': {zp: 160},
	'Pursuit': {zp: 100},
	'Quick Attack': {zp: 100},
	'Rapid Spin': {zp: 100},
	'Razor Leaf': {zp: 120},
	'Razor Shell': {zp: 140},
	'Relic Song': {zp: 140},
	'Retaliate': {zp: 140},
	'Return': {zp: 160},
	'Revelation Dance': {
		bp: 90,
		type: 'Normal',
		category: 'Special',
		zp: 175
	},
	'Revenge': {zp: 120},
	'Reversal': {zp: 160},
	'Roar of Time': {zp: 200},
	'Rock Blast': {isBullet: true, zp: 140},
	'Rock Climb': {zp: 175},
	'Rock Slide': {zp: 140},
	'Rock Smash': {zp: 100},
	'Rock Throw': {zp: 100},
	'Rock Tomb': {zp: 140},
	'Rock Wrecker': {zp: 200},
	'Round': {zp: 120},
	'Sacred Fire': {zp: 180},
	'Sacred Sword': {zp: 175},
	'Sand Tomb': {zp: 100},
	'Savage Spin-Out': {
		bp: 1,
		type: 'Bug',
		category: 'Physical',
		isZ: true
	},
	'Scald': {zp: 160},
	'Searing Shot': {zp: 180},
	'Searing Sunraze Smash': {
		bp: 200,
		type: 'Steel',
		category: 'Physical',
		makesContact: true,
		isZ: true
	},
	'Secret Power': {zp: 140},
	'Secret Sword': {zp: 160},
	'Seed Bomb': {zp: 160},
	'Seed Flare': {zp: 190},
	'Seismic Toss': {zp: 100},
	'Self-Destruct': {zp: 200},
	'Shadow Claw': {zp: 140},
	'Shadow Force': {zp: 190},
	'Shadow Sneak': {zp: 100},
	'Shadow Strike': {zp: 160},
	'Shattered Psyche': {
		bp: 1,
		type: 'Psychic',
		category: 'Physical',
		isZ: true
	},
	'Shadow Ball': {zp: 160},
	'Shadow Bone': {
		bp: 85,
		type: 'Ghost',
		category: 'Physical',
		hasSecondaryEffect: true,
		zp: 160
	},
	'Shadow Punch': {zp: 120},
	'Sheer Cold': {zp: 180},
	'Shell Trap': {
		bp: 150,
		type: 'Fire',
		category: 'Special',
		isSpread: true,
		zp: 200
	},
	'Shock Wave': {zp: 120},
	'Signal Beam': {zp: 140},
	'Silver Wind': {zp: 120},
	'Sinister Arrow Raid': {
		bp: 180,
		type: 'Ghost',
		category: 'Physical',
		isZ: true
	},
	'Skull Bash': {zp: 195},
	'Sky Attack': {zp: 200},
	'Sky Drop': {zp: 120},
	'Sky Uppercut': {zp: 160},
	'Slash': {zp: 140},
	'Sludge': {zp: 120},
	'Sludge Bomb': {zp: 175},
	'Sludge Wave': {zp: 175},
	'Smack Down': {zp: 100},
	'Smart Strike': {
		bp: 70,
		type: 'Steel',
		category: 'Physical',
		makesContact: true,
		zp: 140
	},
	'Snarl': {zp: 100},
	'Solar Beam': {zp: 190},
	'Solar Blade': {
		bp: 125,
		type: 'Grass',
		category: 'Physical',
		makesContact: true,
		zp: 190
	},
	'Soul-Stealing 7-Star Strike': {
		bp: 195,
		type: 'Ghost',
		category: 'Physical',
		isZ: true
	},
	'Spacial Rend': {zp: 180},
	'Spark': {zp: 120},
	'Sparkling Aria': {
		bp: 90,
		type: 'Water',
		category: 'Special',
		isSound: true,
		isSpread: true,
		zp: 175
	},
	'Spectral Thief': {
		bp: 90,
		type: 'Ghost',
		category: 'Physical',
		makesContact: true,
		zp: 175
	},
	'Spirit Shackle': {
		bp: 80,
		type: 'Ghost',
		category: 'Physical',
		hasSecondaryEffect: true,
		zp: 160
	},
	'Splintered Stormshards': {
		bp: 190,
		type: 'Rock',
		category: 'Physical',
		isZ: true
	},
	'Steam Eruption': {zp: 185},
	'Steamroller': {zp: 120},
	'Steel Wing': {zp: 140},
	'Stoked Sparksurfer': {
		bp: 175,
		type: 'Electric',
		category: 'Special',
		isZ: true
	},
	'Stomping Tantrum': {
		bp: 75,
		type: 'Ground',
		category: 'Physical',
		makesContact: true,
		zp: 140
	},
	'Stone Edge': {zp: 180},
	'Stored Power': {zp: 160},
	'Storm Throw': {zp: 120},
	'Struggle Bug': {zp: 100},
	'Submission': {zp: 160},
	'Subzero Slammer': {
		bp: 1,
		type: 'Ice',
		category: 'Physical',
		isZ: true
	},
	'Sucker Punch': {bp: 70, zp: 140},
	'Sunsteel Strike': {
		bp: 100,
		type: 'Steel',
		category: 'Physical',
		makesContact: true,
		zp: 180
	},
	'Super Fang': {zp: 100},
	'Superpower': {zp: 190},
	'Supersonic Skystrike': {
		bp: 1,
		type: 'Flying',
		category: 'Physical',
		isZ: true
	},
	'Surf': {zp: 175},
	'Swift': {zp: 120},
	'Synchronoise': {zp: 190},
	'Tackle': {bp: 40, zp: 100},
	'Take Down': {zp: 160},
	'Tail Slap': {zp: 140},
	'Techno Blast': {zp: 190},
	'Tectonic Rage': {
		bp: 1,
		type: 'Ground',
		category: 'Physical',
		isZ: true
	},
	'Thief': {zp: 120},
	'Thousand Arrows': {zp: 180},
	'Thousand Waves': {zp: 175},
	'Thrash': {zp: 190},
	'Throat Chop': {
		bp: 80,
		type: 'Dark',
		category: 'Physical',
		makesContact: true,
		zp: 160
	},
	'Thunder': {zp: 185},
	'Thunderbolt': {zp: 175},
	'Thunder Fang': {zp: 120},
	'Thunder Punch': {zp: 140},
	'Tri Attack': {zp: 160},
	'Trop Kick': {
		bp: 70,
		type: 'Grass',
		category: 'Physical',
		hasSecondaryEffect: true,
		makesContact: true,
		zp: 140
	},
	'Twineedle': {zp: 100},
	'Twinkle Tackle': {
		bp: 1,
		type: 'Fairy',
		category: 'Physical',
		isZ: true
	},
	'U-turn': {zp: 140},
	'Uproar': {zp: 175},
	'V-create': {zp: 220},
	'Vacuum Wave': {zp: 100},
	'Venoshock': {zp: 120},
	'Volt Switch': {zp: 140},
	'Volt Tackle': {zp: 190},
	'Wake-Up Slap': {zp: 140},
	'Waterfall': {zp: 160},
	'Water Pledge': {zp: 160},
	'Water Pulse': {zp: 120},
	'Water Shuriken': {category: 'Special', zp: 100},
	'Water Spout': {zp: 200},
	'Weather Ball': {zp: 160},
	'Whirlpool': {zp: 100},
	'Wild Charge': {zp: 175},
	'Wing Attack': {zp: 120},
	'Wood Hammer': {zp: 190},
	'Wring Out': {zp: 190},
	'X-Scissor': {zp: 160},
	'Zap Cannon': {zp: 190},
	'Zen Headbutt': {zp: 160},
	'Zing Zap': {
		bp: 80,
		type: 'Electric',
		category: 'Physical',
		hasSecondaryEffect: true,
		makesContact: true,
		zp: 160
	}
});
