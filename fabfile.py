from __future__ import print_function

import json
import os
import os.path
import random

from fabric.api import local, task
from faker import Factory
import jinja2

here = os.path.abspath(os.path.split(__file__)[0])
tmpl_path = os.path.join(here, 'app', 'templates')
tmpl_env = jinja2.Environment(loader=jinja2.FileSystemLoader(tmpl_path))

def herepath(path):
    return os.path.join(here, path)

@task
def genrandom():
    print("Generating random parties/candidates/ballots...")

    fake = Factory.create('en_AU')

    def _party():
        return '%s %s' % (fake.color_name(), fake.color_name())

    def _party_abbrev(party_name):
        return ''.join([x[0] for x in party_name.split()])

    def _candidate():
        last_name = fake.last_name()
        first_name = fake.first_name_female()
        return '%s, %s' % (last_name.upper(), first_name)

    parties = [_party() for x in range(15)]
    parties = {_party_abbrev(name): name for name in parties}

    reps_parties = random.sample(parties.keys(), 6)

    reps_candidates = []
    for position, party in enumerate(reps_parties, 1):
        reps_candidates.append({
            'position': position,
            'name': _candidate(),
            'party': party,
        })

    senate_candidates = []
    for position, party in enumerate(parties.keys(), 1):
        candidates = []
        for x in range(6):
            candidates.append({
                'position': x + 1,
                'name': _candidate(),
                'party': party,
            })
        senate_candidates.append({
            'position': position,
            'party': party,
            'candidates': candidates,
        })

    os.makedirs(herepath('data'))

    data = {
        'parties': parties,
        'reps': reps_candidates,
        'senate': senate_candidates
    }
    with open(herepath('data/data.json'), 'w') as datafile:
        json.dump(data, datafile)

@task(name="import")
def importdata():
    print("Importing AEC data...")
    local("python import.py")

@task
def build(division='grayndler'):
    print("Rendering editor test html...")
    with open(herepath('data/%s.json' % division)) as datafile:
        data = datafile.read().strip()
    for editor in ['reps-test.html', 'senate-test.html']:
        editor_test = tmpl_env.get_template(editor)
        with open(herepath('public/' + editor), 'w') as outfile:
            outfile.write(editor_test.render(data=data))
