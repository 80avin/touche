/*
 * Copyright 2020 - 2022 José Expósito <jose.exposito89@gmail.com>
 *
 * This file is part of Touché.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation,  either version 3 of the License,  or (at your option)  any later
 * version.
 *
 * This program is distributed in the hope that it will be useful,  but  WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the  GNU General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>.
 */
import AnimationComboBoxText from '~/main-view/content/row-settings/animation-combo-box-text';
import NoScrollComboBoxText from '~/utils/no-scroll-combo-box-text';

const { GObject, Gtk } = imports.gi;

class RunCommandRowSettings extends Gtk.Grid {
  _init(gesture) {
    super._init({
      row_spacing: 8,
      column_spacing: 16,
    });

    this.gesture = gesture;
    this.repeatChanged = this.repeatChanged.bind(this);

    // Command label and entry
    const commandLabel = new Gtk.Label({
      label: _('Command:'),
      halign: Gtk.Align.END,
    });

    this.commandEntry = new Gtk.Entry({
      hexpand: true,
      valign: Gtk.Align.CENTER,
      text: gesture?.actionSettings?.command ?? '',
    });

    // Repeat label and switch
    const repeatLabel = new Gtk.Label({
      label: _('Repeat command:'),
      halign: Gtk.Align.END,
    });

    this.repeatSwitch = new Gtk.Switch({
      halign: Gtk.Align.START,
      valign: Gtk.Align.CENTER,
    });
    const isRepeatActive = (gesture?.actionSettings?.repeat === 'true');
    this.repeatSwitch.active = isRepeatActive;

    // When repeat is false, display the on begin/end combo
    this.onBeginEndLabel = new Gtk.Label({
      label: _('Execute on:'),
      halign: Gtk.Align.END,
    });

    this.onBeginEndCombo = new NoScrollComboBoxText({
      hexpand: true,
      valign: Gtk.Align.CENTER,
    });
    this.onBeginEndCombo.append('begin', _('Gesture begin'));
    this.onBeginEndCombo.append('end', _('Gesture end'));
    this.onBeginEndCombo.append('begin-and-end', _('Gesture begin and end'));
    this.onBeginEndCombo.active_id = gesture?.actionSettings?.on ?? 'begin';

    // When repeat is true, display the opposite direction command entry
    this.oppositeCommandLabel = new Gtk.Label({
      label: _('Opposite command:'),
      halign: Gtk.Align.END,
    });

    this.oppositeCommandEntry = new Gtk.Entry({
      hexpand: true,
      valign: Gtk.Align.CENTER,
      text: gesture?.actionSettings?.decreaseCommand ?? '',
      placeholder_text: _('Run this command when the gesture goes in the opposite direction'),
    });

    // Animation label and combo
    this.animationLabel = new Gtk.Label({
      label: _('Animation:'),
      halign: Gtk.Align.END,
    });

    this.animationCombo = new AnimationComboBoxText({
      hexpand: true,
      valign: Gtk.Align.CENTER,
    });
    this.animationCombo.setAnimationType(gesture?.actionSettings?.animation);

    // Signals & Properties
    this.repeatSwitch.connect('state_set', (self, state) => this.repeatChanged(state));

    // Changed signal
    this.commandEntry.connect('changed', () => this.emit('changed'));
    this.repeatSwitch.connect('state_set', () => this.emit('changed'));
    this.oppositeCommandEntry.connect('changed', () => this.emit('changed'));
    this.onBeginEndCombo.connect('changed', () => this.emit('changed'));
    this.animationCombo.connect('changed', () => this.emit('changed'));

    // Layout
    this.attach(commandLabel, 0, 0, 1, 1);
    this.attach(this.commandEntry, 1, 0, 1, 1);
    this.attach(repeatLabel, 0, 1, 1, 1);
    this.attach(this.repeatSwitch, 1, 1, 1, 1);
    this.repeatChanged(isRepeatActive);
  }

  repeatChanged(isRepeatActive) {
    this.remove_row(3);
    this.remove_row(2);

    if (isRepeatActive) {
      this.attach(this.oppositeCommandLabel, 0, 2, 1, 1);
      this.attach(this.oppositeCommandEntry, 1, 2, 1, 1);
    } else {
      this.attach(this.onBeginEndLabel, 0, 2, 1, 1);
      this.attach(this.onBeginEndCombo, 1, 2, 1, 1);
    }

    this.attach(this.animationLabel, 0, 3, 1, 1);
    this.attach(this.animationCombo, 1, 3, 1, 1);
  }

  getSettings() {
    const actionSettings = {
      command: this.commandEntry.text,
      repeat: JSON.stringify(this.repeatSwitch.get_active()),
      animation: this.animationCombo.getAnimationType(),
    };

    if (this.repeatSwitch.get_active()) {
      actionSettings.decreaseCommand = this.oppositeCommandEntry.text;
    } else {
      actionSettings.on = this.onBeginEndCombo.active_id;
    }

    return actionSettings;
  }
}

export default GObject.registerClass(
  {
    Signals: {
      changed: {},
    },
  },
  RunCommandRowSettings,
);
