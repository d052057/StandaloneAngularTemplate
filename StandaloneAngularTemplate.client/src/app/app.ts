import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherForecastService, WeatherForecast } from './services/weather-forecast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('standalone angular template client');

  // Demonstrates the client calling the sample WeatherForecastController via HttpClient.
  // Remove this once you're wiring up your own API calls.
  protected readonly forecasts = signal<WeatherForecast[]>([]);
  protected readonly forecastError = signal<string | null>(null);

  constructor(private weatherForecastService: WeatherForecastService) {}

  ngOnInit(): void {
    this.weatherForecastService.getForecasts().subscribe({
      next: (data) => this.forecasts.set(data),
      error: () => this.forecastError.set('Could not reach the API. Is the backend running?')
    });
  }
}
