import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FORMATION_SLUGS } from '../../models/formations-catalog';

@Component({
  selector: 'app-formation-picker',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './formation-picker.component.html',
  styleUrl: './formation-picker.component.scss',
})
export class FormationPickerComponent {
  protected readonly slugs = FORMATION_SLUGS;
}
