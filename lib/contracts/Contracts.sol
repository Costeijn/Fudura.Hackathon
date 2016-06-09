contract PowerCountingSystem {

  Segment[] segments;
  Meter[] meters;

  function addSegment(Segment _segment) {
    segments.push(_segment);
  }

  function connectSegments(Segment _in, Segment _out) returns (Meter _meter) {
    meters.push(new Meter(_in, _out));
    _meter = meters[meters.length - 1];

    // Note that the input side of this meter connects to the segment as output
    // while the output side connects to the segment as input.
    _in.connectMeter(_meter, false);
    _out.connectMeter(_meter, true);
  }

  function segmentCount() constant returns (uint _count) {
    _count = segments.length;
  }

  function segment(uint _index) constant returns (Segment _segment) {
    _segment = segments[_index];
  }

  function meterCount() constant returns (uint _count) {
    _count = meters.length;
  }

  function meter(uint _index) constant returns (Meter _meter) {
    _meter = meters[_index];
  }

  function verify() constant returns (bool _ok) {
    _ok = true;
    for (uint i = 0; i < segments.length; i++) {
      _ok = _ok && segments[i].verify();
    }
  }

  function accountPower() constant returns (int _openIn, int _openOut, int _closedIn, int _closedOut) {
    for (uint i = 0; i < segments.length; i++) {
      int segmentValue = segments[i].valueSum();
      if (segments[i].closed()) {
        if (segmentValue > 0) {
          _closedOut += segmentValue;
        } else {
          _closedIn -= segmentValue;
        }
      } else {
        if (segmentValue > 0) {
          _openOut += segmentValue;
        } else {
          _openIn -= segmentValue;
        }
      }
    }
  }

}

contract Segment {

  modifier onlySystem { if (msg.sender != address(system)) { throw; } _ }

  PowerCountingSystem system;
  bytes32 public name;
  bool public closed;
  Meter[] inputMeters;
  Meter[] outputMeters;

  function Segment(PowerCountingSystem _system, bytes32 _name, bool _closed) {
    system = _system;
    name = _name;
    closed = _closed;
  }

  function connectMeter(Meter _meter, bool _input) onlySystem {
    if (_input) {
      inputMeters.push(_meter);
    } else {
      outputMeters.push(_meter);
    }
  }

  function inputMeterCount() constant returns (uint _count) {
    _count = inputMeters.length;
  }

  function inputMeter(uint _index) constant returns (Meter _meter) {
    _meter = inputMeters[_index];
  }

  function outputMeterCount() constant returns (uint _count) {
    _count = outputMeters.length;
  }

  function outputMeter(uint _index) constant returns (Meter _meter) {
    _meter = outputMeters[_index];
  }

  function valueSum() constant returns (int _sum) {
    uint i;
    for (i = 0; i < inputMeters.length; i++) {
      _sum += inputMeters[i].value();
    }
    for (i = 0; i < outputMeters.length; i++) {
      _sum -= outputMeters[i].value();
    }
  }

  function verify() constant returns (bool _ok) {
    _ok = !closed || valueSum() == 0;
  }

}

contract Meter {

  Segment public inSegment;
  Segment public outSegment;
  int public value;

  function Meter(Segment _inSegment, Segment _outSegment) {
    inSegment = _inSegment;
    outSegment = _outSegment;
    value = 0;
  }

  function registerValue(int _value) {
    value = _value;
  }

}
