package com.example.insync;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import android.os.Bundle;
import android.bluetooth.*;
import android.content.Intent;
import android.graphics.Color;
import android.app.Activity;
import android.view.Menu;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;

public class CreateSession extends Activity {

	String globalPath = "";
	// duration that the device is discoverable
	private static final int DISCOVER_DURATION = 300;
	// our request code (must be greater than zero)
	private static final int REQUEST_BLU = 1;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_create_session);

		// Prevents on-screen keyboard from popping up when Activity is started
		getWindow().setSoftInputMode(
				WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN);

		enableBluetooth();

		// Code for "Choose an mp3 file to live stream" button
		final Button fCButton = (Button) findViewById(R.id.chooseFileButton);
		fCButton.setOnClickListener(new OnClickListener() {
			public void onClick(View v) {
				try {
					Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
					intent.setType("file/*");
					final int PICKFILE_RESULT_CODE = 1;
					startActivityForResult(intent, PICKFILE_RESULT_CODE);
				}

				// Activity Not Found Crash fix
				// Updates TextView with message to install a file browser
				catch (Exception e) {
					final TextView fnTV = (TextView) findViewById(R.id.fileNameTextView);
					fnTV.setText("Error: No File Browser found! Please install a file browser (Such as ASTRO File Manager) to browse for an MP3 file.");
					fnTV.setTextColor(Color.RED);
				}
			}
		});

		final Button confirmbutton = (Button) findViewById(R.id.sendfilebutton);
		confirmbutton.setOnClickListener(new OnClickListener() {
			public void onClick(View v) {
				if (existFilePath()) {
					hostBluetooth(getFilePath());
				} else {
					final TextView fnTV = (TextView) findViewById(R.id.fileNameTextView);
					fnTV.setText("Choose a song before clicking on the confirm button, silly! :(");
					fnTV.setTextColor(Color.RED);
				}
			}
		});
	}

	public String setFilePath(String path) {
		globalPath = path;
		return globalPath;
	}

	public String getFilePath() {
		return globalPath;
	}

	public boolean existFilePath() {
		if (globalPath.equals("")) {
			return false;
		} else {
			return true;
		}
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		// Called after File Browser Activity returns file
		final int PICKFILE_RESULT_CODE = 1;
		switch (requestCode) {
		case PICKFILE_RESULT_CODE:
			if (resultCode == RESULT_OK) {
				// Retrieve URI and display it in the TextView
				String FilePath = data.getData().getPath();
				final TextView textFile = (TextView) findViewById(R.id.fileNameTextView);
				textFile.setText("MP3 File Selected: " + FilePath);
				setFilePath(FilePath);
			}
			break;

		}
	}

	public void hostBluetooth(String filePath) {
		Intent intent = new Intent(this, BluetoothHost.class);
		intent.putExtra("filepath", filePath);
		startActivity(intent);
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {

		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.create_session, menu);
		return true;
	}

	public void enableBluetooth() {
		BluetoothAdapter bA = BluetoothAdapter.getDefaultAdapter();

		// Enable Bluetooth
		if (!bA.isEnabled()) {
			bA.enable();
			final TextView btCheck = (TextView) findViewById(R.id.bluetoothCheck);
			btCheck.setText("Turning Bluetooth on to detect other Android devices");
		}
		
		//Enable device discovery
		enableBlu();
		
		// List all paired Bluetooth Devices
		Set<BluetoothDevice> pairedDevices = bA.getBondedDevices();
		List<String> s = new ArrayList<String>();
		for (BluetoothDevice bt : pairedDevices) {
			s.add(bt.getName() + " - " + bt.getAddress() + "\n");
		}

		// Update TextView with list of Bluetooth Devices
		final TextView btDevTV = (TextView) findViewById(R.id.bluetoothTV);
		btDevTV.append("\n" + s.toString());

	}
	public void enableBlu(){
		// enable device discovery - this will automatically enable Bluetooth
		Intent discoveryIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE);

		discoveryIntent.putExtra(BluetoothAdapter.EXTRA_DISCOVERABLE_DURATION,
		                            DISCOVER_DURATION );

		startActivityForResult(discoveryIntent, REQUEST_BLU);
		}

}
