import sys
import time

def print_slow(text, delay=0.03):
    """Prints text with a typewriter effect for visual novel formatting."""
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(delay)
    print()

class GameState:
    def __init__(self):
        self.player_name = ""
        self.player_pronouns = ""
        self.crush_name = ""
        self.crush_pronouns = ""
        self.hunger = 30  # Starts at 30%. Reaching 100% means Game Over (you bit them).
        self.affection = 0  # Romance points with your crush.

def intro_screen():
    print("=" * 60)
    print("             🧠 BRAIN-DEAD FOR YOU 🖤")
    print("       A Queer, Cozy-Apocalyptic Dating Sim")
    print("=" * 60)
    print("Based on 'The Zombie Song'\n")

def choose_characters(state):
    print("CHOOSE YOUR PROTAGONIST:")
    print("1. ASH (He/Him) - The Soft-Hearted Slacker Art Student")
    print("2. CLEO (She/Her) - The Alt-Rock Riot Grrrl")
    
    choice = input("\nSelect (1 or 2): ").strip()
    if choice == "1":
        state.player_name = "Ash"
        state.player_pronouns = ("he", "him", "his")
        
        print("\nCHOOSE YOUR CRUSH:")
        print("1. JULIAN (He/Him) - The Grumpy Lookout who watches the fence.")
        print("2. MIKA (He/They) - The Sunshine Medic who leaves you raw steak.")
        crush_choice = input("\nSelect (1 or 2): ").strip()
        if crush_choice == "1":
            state.crush_name = "Julian"
            state.crush_pronouns = ("he", "him", "his")
        else:
            state.crush_name = "Mika"
            state.crush_pronouns = ("he", "them", "his")
            
    else:
        state.player_name = "Cleo"
        state.player_pronouns = ("she", "her", "hers")
        
        print("\nCHOOSE YOUR CRUSH:")
        print("1. MAYA (She/Her) - The Badass Mechanic who likes power couples.")
        print("2. ROBIN (They/Them) - The Goth Archivist who quotes tragic love poems.")
        crush_choice = input("\nSelect (1 or 2): ").strip()
        if crush_choice == "1":
            state.crush_name = "Maya"
            state.crush_pronouns = ("she", "her", "hers")
        else:
            state.crush_name = "Robin"
            state.crush_pronouns = ("they", "them", "their")

def display_stats(state):
    print(f"\n[ STATS // Hunger: {state.hunger}% | Affection with {state.crush_name}: {state.affection} ]")
    print("-" * 50)

def play_scene_one(state):
    print_slow(f"\n*** ACT I: IF I WERE A ZOMBIE... ***\n")
    print_slow(f"You are {state.player_name}. You are dead, pale, and your favorite jacket is covered in dirt.")
    print_slow(f"But more importantly, you are completely, desperately in love with {state.crush_name}.")
    print_slow(f"Tonight, you've crept up right to the edge of the survivor camp's chain-link fence.")
    print_slow(f"Through the moonlight, you see {state.crush_name} walking your way. Your dead heart skips a beat.")
    
    display_stats(state)
    
    print_slow(f"{state.crush_name} notices a rustle in the bushes and aims a flashlight directly into your eyes.")
    print_slow(f"\"Hey! Who's out there?\" {state.crush_name} calls out, hand resting on a weapon holster.")
    print_slow("Your stomach rumbles fiercely. The smell of living human is intoxicating.")
    
    print("\nWHAT DO YOU DO?")
    print("1. [Groan Longingly] Try to speak, even though your vocal cords are broken.")
    print("2. [Offer a Gift] Slide the pristine mixtape/wildflowers you scavenged under the fence.")
    print("3. [Stare Hungrily] Lean closer into the light, mesmerized by the scent of brains.")
    
    choice = input("\nSelect (1, 2, or 3): ").strip()
    
    if choice == "1":
        state.hunger += 10
        state.affection += 5
        print_slow("\nYou open your mouth, but all that comes out is a raspy: \"...Gggrrraaaaooohh...\"")
        print_slow(f"{state.crush_name} blinks, tilting {state.crush_pronouns[2]} head. \"Wait... are you trying to say hello?\"")
    elif choice == "2":
        state.affection += 15
        print_slow(f"\nYou quickly slide your scavenged gift under the bottom of the wire fence.")
        print_slow(f"{state.crush_name} steps back, lowering the weapon. {state.crush_pronouns[0].capitalize()} picks it up, a faint blush creeping onto {state.crush_pronouns[2]} face.")
        print_slow(f"\"You... brought this for me? You're not like the other monsters, are you?\"")
    else:
        state.hunger += 35
        state.affection -= 5
        print_slow("\nYou press your face against the cold metal fence, taking a deep, shuddering sniff.")
        print_slow(f"{state.crush_name} flinches, taking a defensive stance. \"Back off, ghoul! Don't make me use this!\"")

def play_scene_two(state):
    print_slow(f"\n*** ACT II: A NO-BRAINER ***\n")
    print_slow(f"A few weeks pass. Your midnight meetings have become a regular secret routine.")
    print_slow(f"Tonight, {state.crush_name} actually opens the side gate, stepping outside the safety perimeter to sit right next to you on an old log.")
    print_slow(f"\"I know it's crazy,\" {state.crush_name} whispers, sitting dangerously close. \"But I think I have feelings for you.\"")
    print_slow(f"{state.crush_name} rests {state.crush_pronouns[2]} warm hand directly over your cold, dead hand. The proximity makes your hunger spike.")
    
    display_stats(state)
    
    if state.hunger >= 65:
        print_slow("(!) WARNING: Your hunger is dangerously high. Up-close contact is risky!")

    print("\nWHAT DO YOU DO?")
    print("1. [Leaning Closer] Squeeze their hand back and try to lean in for a clumsy zombie kiss.")
    print("2. [Distract Yourself] Pull your hand away and point at the stars to control your appetite.")
    print("3. [Bite] Lose control. The biological urge to eat brains overrides your romantic heart.")
    
    choice = input("\nSelect (1, 2, or 3): ").strip()
    
    if choice == "1":
        if state.hunger >= 65:
            print_slow("\nYou try to lean in for a kiss, but as your faces close the distance, the smell of flesh is too much.")
            print_slow("Your instincts snap. You bare your teeth—")
            state.hunger = 100
        else:
            state.affection += 30
            print_slow("\nYou gently squeeze back. Your cold cheek rests against theirs. It's clumsy, quiet, and completely perfect.")
            print_slow(f"\"I'd join the undead just to walk down the street with you,\" {state.crush_name} hums softly, quoting an old song.")
    elif choice == "2":
        state.hunger -= 20
        state.affection += 10
        print_slow("\nYou abruptly pull back, pointing dramatically at the constellation Orion above you.")
        print_slow(f"{state.crush_name} laughs softly. \"Right, sorry. Boundaries. Thanks for keeping me safe from... well, you.\"")
    else:
        state.hunger = 100

def check_ending(state):
    print("\n==============================")
    if state.hunger >= 100:
        print("💔 GAME OVER: THE 'ZOMBIE SONG' TRAGEDY 💔")
        print_slow(f"Your hunger won. You bit {state.crush_name}. As the virus takes hold of them, you realize what you've done.")
        print_slow("At least now... you'll walk down the street together as monsters.")
    elif state.affection >= 30:
        print("🖤 ENDING: HAPPILY EVER UNDEAD 🖤")
        print_slow(f"You managed to win over {state.crush_name} without turning them into a midnight snack!")
        print_slow(f"Whether living or dead, your queer apocalyptic romance is a total no-brainer.")
    else:
        print("🤷 ENDING: JUST APOCALYPTIC FRIENDS 🤷")
        print_slow(f"You managed not to eat {state.crush_name}, but the spark just wasn't strong enough. You remain a friendly perimeter guardian.")
    print("==============================")

def main():
    state = GameState()
    intro_screen()
    choose_characters(state)
    play_scene_one(state)
    
    # Check if a hunger game over happened in scene 1 (unlikely with default values, but safe)
    if state.hunger < 100:
        play_scene_two(state)
        
    check_ending(state)

if __name__ == "__main__":
    main()
    
